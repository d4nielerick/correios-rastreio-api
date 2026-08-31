export type TrackingStatusCode =
  | 'POSTADO'
  | 'EM_TRANSITO'
  | 'SAIU_ENTREGA'
  | 'ENTREGUE'
  | 'AGUARDANDO_RETIRADA'
  | 'TRIBUTADO'
  | 'FISCALIZACAO'
  | 'ATRASADO'
  | 'DEVOLVIDO'
  | 'EXTRAVIADO'
  | 'NAO_ENCONTRADO'
  | 'OUTRO';

export interface TrackingLocation {
  cidade?: string | null;
  uf?: string | null;
  descricao?: string;
}

export interface TrackingEvent {
  data: string; // ISO 8601 string
  dataOriginal: string; // formatted original date string
  status: string;
  categoria: TrackingStatusCode;
  detalhes?: string;
  origem?: string;
  destino?: string;
  local?: string;
}

export interface TrackingResult {
  codigo: string;
  sucesso: boolean;
  servico: {
    sigla: string;
    descricao: string;
  };
  status: TrackingStatusCode;
  descricaoStatus: string;
  entregue: boolean;
  diasEmTransito: number;
  dataPostagem: string | null;
  dataEntrega: string | null;
  totalEventos: number;
  ultimoEvento: TrackingEvent | null;
  eventos: TrackingEvent[];
  consultadoEm: string; // ISO 8601 string
  consultadoEmFormatado: string; // Ex: "31/08/2026 às 14:04:11"
  cache: boolean;
  mensagem?: string;
}

export interface MultiTrackingRequest {
  codigos: string[];
}

export interface MultiTrackingResponse {
  total: number;
  sucessos: number;
  falhas: number;
  resultados: TrackingResult[];
  consultadoEm: string;
  consultadoEmFormatado: string;
}

export interface ServiceSiglaInfo {
  sigla: string;
  nome: string;
  descricao: string;
  categoria: 'EXPRESSO' | 'ECONOMICO' | 'INTERNACIONAL' | 'LOGISTICA_REVERSA' | 'OUTROS';
}

export interface MonitoredPackage {
  codigo: string;
  apelido?: string;
  status: TrackingStatusCode;
  descricaoStatus: string;
  entregue: boolean;
  ultimoEventoData?: string | null;
  webhookUrl?: string;
  notificarNavegador?: boolean;
  criadoEm: string;
  atualizadoEm: string;
  ultimaVerificacao: string;
  ultimaVerificacaoFormatada: string;
  totalEventos: number;
}

export interface HistoryItem {
  codigo: string;
  apelido?: string;
  status: TrackingStatusCode;
  descricaoStatus: string;
  servicoDescricao: string;
  entregue: boolean;
  consultadoEm: string;
  consultadoEmFormatado: string;
  totalEventos: number;
}
