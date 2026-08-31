import { config } from '../config/env.js';
import {
  MultiTrackingResponse,
  TrackingEvent,
  TrackingResult,
  TrackingStatusCode,
} from '../types/tracking.types.js';
import { trackingCache } from './cache.service.js';
import { SiglasService } from './siglas.service.js';
import { StorageService } from './storage.service.js';

export class TrackerService {
  private static readonly CORREIOS_REGEX = /^[A-Za-z]{2}[0-9]{9}[A-Za-z]{2}$/;

  /**
   * Formata uma data para o padrão amigável brasileiro: "31/08/2026 às 14:04:11"
   */
  public static formatBrazilianDateTime(date = new Date()): string {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    try {
      const formatted = new Intl.DateTimeFormat('pt-BR', options).format(date);
      // Replace the comma or space between date and time with " às "
      return formatted.replace(', ', ' às ').replace(' ', ' às ');
    } catch {
      return date.toLocaleString('pt-BR');
    }
  }

  /**
   * Valida se uma string é um código de rastreio válido dos Correios (SRO padrão 13 dígitos)
   */
  public static isValidTrackingCode(code: string): boolean {
    if (!code || typeof code !== 'string') return false;
    return this.CORREIOS_REGEX.test(code.trim());
  }

  /**
   * Formata e limpa o código de rastreio
   */
  public static cleanCode(code: string): string {
    return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  /**
   * Classifica a descrição de um evento em uma categoria padronizada
   */
  public static categorizeStatus(statusText: string, detailsText = ''): TrackingStatusCode {
    const text = `${statusText} ${detailsText}`.toLowerCase();

    if (text.includes('entregue') || text.includes('entrega efetuada') || text.includes('objeto entregue ao destinatário')) {
      return 'ENTREGUE';
    }
    if (text.includes('saiu para entrega') || text.includes('objeto saiu para entrega')) {
      return 'SAIU_ENTREGA';
    }
    if (text.includes('aguardando retirada') || text.includes('disponível para retirada') || text.includes('retirada na agência')) {
      return 'AGUARDANDO_RETIRADA';
    }
    if (text.includes('em trânsito') || text.includes('em transferencia') || text.includes('em transferência') || text.includes('encaminhado')) {
      return 'EM_TRANSITO';
    }
    if (text.includes('postado') || text.includes('objeto postado') || text.includes('recebido pelos correios')) {
      return 'POSTADO';
    }
    if (text.includes('tributado') || text.includes('pagamento confirmado') || text.includes('aguardando pagamento')) {
      return 'TRIBUTADO';
    }
    if (text.includes('fiscalização') || text.includes('aduaneira') || text.includes('receita federal') || text.includes('análise')) {
      return 'FISCALIZACAO';
    }
    if (text.includes('devolvido') || text.includes('devolução') || text.includes('devolvido ao remetente')) {
      return 'DEVOLVIDO';
    }
    if (text.includes('extraviado') || text.includes('sinistro') || text.includes('roubo') || text.includes('furto')) {
      return 'EXTRAVIADO';
    }
    if (text.includes('atrasado') || text.includes('prazo de entrega')) {
      return 'ATRASADO';
    }
    if (text.includes('não encontrado') || text.includes('objeto não localizado')) {
      return 'NAO_ENCONTRADO';
    }

    return 'OUTRO';
  }

  /**
   * Converte strings de data para ISO 8601
   */
  public static parseToIso(dateStr: string): string {
    if (!dateStr) return new Date().toISOString();

    try {
      const direct = new Date(dateStr);
      if (!isNaN(direct.getTime())) {
        return direct.toISOString();
      }

      const brMatch = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
      if (brMatch) {
        const [, day, month, year, hour = '00', min = '00', sec = '00'] = brMatch;
        const parsed = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}-03:00`);
        if (!isNaN(parsed.getTime())) return parsed.toISOString();
      }
    } catch {
      // ignore
    }

    return new Date().toISOString();
  }

  /**
   * Calcula a quantidade de dias em trânsito
   */
  public static calculateDaysInTransit(postDateIso: string | null, lastDateIso: string | null): number {
    if (!postDateIso || !lastDateIso) return 0;
    try {
      const start = new Date(postDateIso).getTime();
      const end = new Date(lastDateIso).getTime();
      const diffMs = Math.max(0, end - start);
      return Math.round(diffMs / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }

  /**
   * Consulta o rastreamento de um objeto com cache e histórico
   */
  public static async track(rawCode: string, bypassCache = false, apelido?: string): Promise<TrackingResult> {
    const code = this.cleanCode(rawCode);
    const now = new Date();
    const consultadoEm = now.toISOString();
    const consultadoEmFormatado = this.formatBrazilianDateTime(now);

    if (!this.isValidTrackingCode(code)) {
      const siglaInfo = SiglasService.getSiglaInfo(code);
      return {
        codigo: code,
        sucesso: false,
        servico: {
          sigla: siglaInfo.sigla,
          descricao: siglaInfo.nome,
        },
        status: 'NAO_ENCONTRADO',
        descricaoStatus: 'Código de rastreio em formato inválido. Use o padrão com 13 caracteres (ex: NL123456789BR).',
        entregue: false,
        diasEmTransito: 0,
        dataPostagem: null,
        dataEntrega: null,
        totalEventos: 0,
        ultimoEvento: null,
        eventos: [],
        consultadoEm,
        consultadoEmFormatado,
        cache: false,
        mensagem: 'Formato de código inválido',
      };
    }

    // Check cache
    if (!bypassCache) {
      const cached = trackingCache.get(code);
      if (cached) {
        StorageService.addHistorico({
          codigo: cached.codigo,
          apelido: apelido || undefined,
          status: cached.status,
          descricaoStatus: cached.descricaoStatus,
          servicoDescricao: cached.servico.descricao,
          entregue: cached.entregue,
          consultadoEm,
          consultadoEmFormatado,
          totalEventos: cached.totalEventos,
        });
        return {
          ...cached,
          consultadoEm,
          consultadoEmFormatado,
        };
      }
    }

    // Fetch from Providers
    let result: TrackingResult;
    try {
      result = await this.fetchFromProvider(code);
    } catch (err: any) {
      const siglaInfo = SiglasService.getSiglaInfo(code);
      result = {
        codigo: code,
        sucesso: false,
        servico: {
          sigla: siglaInfo.sigla,
          descricao: siglaInfo.nome,
        },
        status: 'NAO_ENCONTRADO',
        descricaoStatus: 'Não foi possível obter dados no momento ou objeto ainda não postado.',
        entregue: false,
        diasEmTransito: 0,
        dataPostagem: null,
        dataEntrega: null,
        totalEventos: 0,
        ultimoEvento: null,
        eventos: [],
        consultadoEm,
        consultadoEmFormatado,
        cache: false,
        mensagem: err?.message || 'Falha na consulta',
      };
    }

    // Save in cache if successful or non-empty
    if (result.sucesso && result.totalEventos > 0) {
      trackingCache.set(code, result);
    }

    // Record in history
    StorageService.addHistorico({
      codigo: result.codigo,
      apelido: apelido || undefined,
      status: result.status,
      descricaoStatus: result.descricaoStatus,
      servicoDescricao: result.servico.descricao,
      entregue: result.entregue,
      consultadoEm: result.consultadoEm,
      consultadoEmFormatado: result.consultadoEmFormatado,
      totalEventos: result.totalEventos,
    });

    return result;
  }

  /**
   * Consulta primária via RastreadorDePacotes API
   */
  private static async fetchFromProvider(code: string): Promise<TrackingResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.requestTimeoutMs);

    const siglaInfo = SiglasService.getSiglaInfo(code);
    const now = new Date();
    const consultadoEm = now.toISOString();
    const consultadoEmFormatado = this.formatBrazilianDateTime(now);

    try {
      const url = `https://api.rastreadordepacotes.com.br/rastreio/${encodeURIComponent(code)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const json: any = await res.json();
      const trackingData = json?.tracking?.[0];

      if (!trackingData) {
        throw new Error('Nenhum dado retornado para o código');
      }

      const rawPositions: any[] = Array.isArray(trackingData.Posicoes) ? trackingData.Posicoes : [];
      const eventos: TrackingEvent[] = [];

      for (const pos of rawPositions) {
        const rawDate = pos.Data || pos.data || '';
        const isoDate = this.parseToIso(rawDate);
        const acao = pos.Acao || pos.acao || pos.Status || pos.status || 'Atualização';
        const detalhes = pos.DetalhesFormatado || pos.detalhes || pos.Detalhes || '';

        let origem: string | undefined = undefined;
        let destino: string | undefined = undefined;

        if (detalhes.includes('para')) {
          const parts = detalhes.split(/para/i);
          if (parts.length >= 2) {
            origem = parts[0].replace(/de\s+/i, '').trim();
            destino = parts[1].trim();
          }
        }

        const categoria = this.categorizeStatus(acao, detalhes);

        eventos.push({
          data: isoDate,
          dataOriginal: rawDate,
          status: acao,
          categoria,
          detalhes: detalhes || undefined,
          origem: origem || undefined,
          destino: destino || undefined,
          local: destino || origem || undefined,
        });
      }

      // Sort newest first
      eventos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

      const totalEventos = eventos.length;
      const ultimoEvento = totalEventos > 0 ? eventos[0] : null;
      const primeiroEvento = totalEventos > 0 ? eventos[totalEventos - 1] : null;

      const isDelivered = eventos.some((e) => e.categoria === 'ENTREGUE');
      const dataPostagem = primeiroEvento ? primeiroEvento.data : null;
      const dataEntrega = isDelivered && ultimoEvento ? ultimoEvento.data : null;

      const diasEmTransito = this.calculateDaysInTransit(
        dataPostagem,
        dataEntrega || (ultimoEvento ? ultimoEvento.data : null)
      );

      const statusGeral = ultimoEvento ? ultimoEvento.categoria : 'NAO_ENCONTRADO';
      const descricaoGeral = ultimoEvento
        ? `${ultimoEvento.status}${ultimoEvento.detalhes ? ' - ' + ultimoEvento.detalhes : ''}`
        : 'Objeto ainda não possui movimentações no sistema dos Correios.';

      return {
        codigo: code,
        sucesso: true,
        servico: {
          sigla: siglaInfo.sigla,
          descricao: siglaInfo.nome,
        },
        status: statusGeral,
        descricaoStatus: descricaoGeral,
        entregue: isDelivered,
        diasEmTransito,
        dataPostagem,
        dataEntrega,
        totalEventos,
        ultimoEvento,
        eventos,
        consultadoEm,
        consultadoEmFormatado,
        cache: false,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Consulta múltiplos códigos de rastreamento em paralelo
   */
  public static async trackMultiple(
    rawCodes: string[],
    bypassCache = false
  ): Promise<MultiTrackingResponse> {
    const cleanList = Array.from(
      new Set(
        rawCodes
          .filter((c) => typeof c === 'string' && c.trim().length > 0)
          .map((c) => this.cleanCode(c))
      )
    ).slice(0, 50);

    const promises = cleanList.map((code) => this.track(code, bypassCache));
    const results = await Promise.all(promises);

    const sucessos = results.filter((r) => r.sucesso && r.totalEventos > 0).length;
    const falhas = results.length - sucessos;
    const now = new Date();

    return {
      total: results.length,
      sucessos,
      falhas,
      resultados: results,
      consultadoEm: now.toISOString(),
      consultadoEmFormatado: this.formatBrazilianDateTime(now),
    };
  }
}
