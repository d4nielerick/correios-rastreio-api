import { MonitoredPackage, TrackingResult } from '../types/tracking.types.js';
import { StorageService } from './storage.service.js';
import { TrackerService } from './tracker.service.js';

export class MonitorService {
  private static timer: NodeJS.Timeout | null = null;
  private static isRunning = false;

  /**
   * Inicia o ciclo de monitoramento periódico em segundo plano
   * @param intervalMs Intervalo de verificação em milissegundos (padrão: 15 minutos)
   */
  public static startScheduler(intervalMs = 15 * 60 * 1000) {
    if (this.timer) clearInterval(this.timer);

    console.log(`[MonitorService] Iniciado agendador de monitoramento a cada ${Math.round(intervalMs / 60000)} minutos.`);

    setTimeout(() => {
      this.checkAllMonitored().catch(console.error);
    }, 30000);

    this.timer = setInterval(() => {
      this.checkAllMonitored().catch(console.error);
    }, intervalMs);
  }

  public static stopScheduler() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Adiciona ou atualiza um pacote na lista de monitoramento
   */
  public static async registerPackage(
    codigo: string,
    apelido?: string,
    webhookUrl?: string,
    notificarNavegador = true
  ): Promise<MonitoredPackage> {
    const result = await TrackerService.track(codigo);

    const existing = StorageService.getMonitorado(codigo);
    const now = new Date();
    const nowIso = now.toISOString();
    const nowFormatado = TrackerService.formatBrazilianDateTime(now);

    const monitored: MonitoredPackage = {
      codigo: result.codigo,
      apelido: apelido || existing?.apelido || undefined,
      status: result.status,
      descricaoStatus: result.descricaoStatus,
      entregue: result.entregue,
      ultimoEventoData: result.ultimoEvento?.data || null,
      webhookUrl: webhookUrl !== undefined ? webhookUrl : existing?.webhookUrl,
      notificarNavegador: notificarNavegador !== undefined ? notificarNavegador : (existing?.notificarNavegador ?? true),
      criadoEm: existing?.criadoEm || nowIso,
      atualizadoEm: nowIso,
      ultimaVerificacao: nowIso,
      ultimaVerificacaoFormatada: nowFormatado,
      totalEventos: result.totalEventos,
    };

    StorageService.addOrUpdateMonitorado(monitored);
    return monitored;
  }

  /**
   * Executa a checagem de todos os pacotes monitorados não entregues
   */
  public static async checkAllMonitored(): Promise<{ checked: number; updated: number }> {
    if (this.isRunning) return { checked: 0, updated: 0 };
    this.isRunning = true;

    try {
      const all = StorageService.getMonitorados();
      const pending = all.filter((p) => !p.entregue);

      let updatedCount = 0;

      for (const item of pending) {
        try {
          const fresh = await TrackerService.track(item.codigo, true);

          const hasStatusChange = fresh.status !== item.status;
          const hasNewEvents = fresh.totalEventos !== item.totalEventos;
          const now = new Date();
          const nowIso = now.toISOString();
          const nowFormatado = TrackerService.formatBrazilianDateTime(now);

          if (hasStatusChange || hasNewEvents) {
            console.log(`[MonitorService] 🔔 Alteração detectada no pacote ${item.codigo} (${item.apelido || 'sem apelido'}): ${item.status} -> ${fresh.status}`);

            if (item.webhookUrl) {
              await this.dispatchWebhook(item.webhookUrl, item, fresh);
            }

            const updatedPkg: MonitoredPackage = {
              ...item,
              status: fresh.status,
              descricaoStatus: fresh.descricaoStatus,
              entregue: fresh.entregue,
              ultimoEventoData: fresh.ultimoEvento?.data || null,
              totalEventos: fresh.totalEventos,
              atualizadoEm: nowIso,
              ultimaVerificacao: nowIso,
              ultimaVerificacaoFormatada: nowFormatado,
            };

            StorageService.addOrUpdateMonitorado(updatedPkg);
            updatedCount++;
          } else {
            StorageService.addOrUpdateMonitorado({
              ...item,
              ultimaVerificacao: nowIso,
              ultimaVerificacaoFormatada: nowFormatado,
            });
          }
        } catch (err: any) {
          console.error(`[MonitorService] Erro ao verificar pacote ${item.codigo}:`, err.message);
        }
      }

      return { checked: pending.length, updated: updatedCount };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Envia notificação para Webhook (Discord, Telegram ou HTTP POST genérico)
   */
  public static async dispatchWebhook(
    webhookUrl: string,
    monitored: MonitoredPackage,
    fresh: TrackingResult
  ) {
    try {
      const isDiscord = webhookUrl.includes('discord.com/api/webhooks');
      const isTelegram = webhookUrl.includes('api.telegram.org');

      let body: any;

      if (isDiscord) {
        const color = fresh.entregue ? 0x00e575 : fresh.status === 'SAIU_ENTREGA' ? 0xffcc00 : 0x0088ff;
        const title = `📦 Atualização: ${monitored.apelido ? monitored.apelido + ' (' + fresh.codigo + ')' : fresh.codigo}`;

        body = {
          username: 'Correios Tracker Bot',
          embeds: [
            {
              title,
              description: `**Status:** ${fresh.status.replace('_', ' ')}\n**Detalhe:** ${fresh.descricaoStatus}`,
              color,
              fields: [
                { name: 'Serviço', value: fresh.servico.descricao, inline: true },
                { name: 'Dias em Trânsito', value: `${fresh.diasEmTransito} dias`, inline: true },
                { name: 'Entregue?', value: fresh.entregue ? '✅ Sim' : '🚚 Em andamento', inline: true },
                {
                  name: 'Último Local',
                  value: fresh.ultimoEvento?.local || fresh.ultimoEvento?.origem || 'Não informado',
                  inline: false,
                },
                {
                  name: 'Horário da Consulta',
                  value: fresh.consultadoEmFormatado,
                  inline: false,
                },
              ],
              footer: { text: `Correios Tracker API • ${fresh.consultadoEmFormatado}` },
              timestamp: new Date().toISOString(),
            },
          ],
        };
      } else if (isTelegram) {
        const text = `📦 *Atualização Correios*\n\n` +
          `*Código:* \`${fresh.codigo}\`\n` +
          (monitored.apelido ? `*Identificação:* ${monitored.apelido}\n` : '') +
          `*Status:* ${fresh.status.replace('_', ' ')}\n` +
          `*Detalhes:* ${fresh.descricaoStatus}\n` +
          `*Dias em trânsito:* ${fresh.diasEmTransito} dias\n` +
          `*Horário da Consulta:* ${fresh.consultadoEmFormatado}`;

        body = {
          text,
          parse_mode: 'Markdown',
        };
      } else {
        body = {
          event: 'package.updated',
          codigo: fresh.codigo,
          apelido: monitored.apelido,
          statusAnterior: monitored.status,
          statusNovo: fresh.status,
          descricaoStatus: fresh.descricaoStatus,
          entregue: fresh.entregue,
          diasEmTransito: fresh.diasEmTransito,
          totalEventos: fresh.totalEventos,
          ultimoEvento: fresh.ultimoEvento,
          consultadoEm: fresh.consultadoEm,
          consultadoEmFormatado: fresh.consultadoEmFormatado,
          timestamp: new Date().toISOString(),
        };
      }

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      console.log(`[MonitorService] Webhook enviado para ${webhookUrl.slice(0, 30)}... Status: ${res.status}`);
    } catch (err: any) {
      console.error(`[MonitorService] Falha ao enviar Webhook:`, err.message);
    }
  }
}
