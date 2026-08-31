import { ServiceSiglaInfo } from '../types/tracking.types.js';

export const SIGLAS_CORREIOS: Record<string, ServiceSiglaInfo> = {
  // SEDEX
  SB: { sigla: 'SB', nome: 'SEDEX 10', descricao: 'SEDEX 10 Encomenda Expressa com entrega até as 10h', categoria: 'EXPRESSO' },
  SE: { sigla: 'SE', nome: 'SEDEX', descricao: 'SEDEX Encomenda Expressa', categoria: 'EXPRESSO' },
  SF: { sigla: 'SF', nome: 'SEDEX Hoje', descricao: 'SEDEX com entrega no mesmo dia da postagem', categoria: 'EXPRESSO' },
  SG: { sigla: 'SG', nome: 'SEDEX do Grande Usuário', descricao: 'SEDEX para clientes corporativos', categoria: 'EXPRESSO' },
  SI: { sigla: 'SI', nome: 'SEDEX Internacional', descricao: 'SEDEX Internacional Express', categoria: 'EXPRESSO' },
  SJ: { sigla: 'SJ', nome: 'SEDEX Hoje', descricao: 'SEDEX Hoje com entrega expressa', categoria: 'EXPRESSO' },
  SL: { sigla: 'SL', nome: 'SEDEX Lógica', descricao: 'SEDEX sem contrato', categoria: 'EXPRESSO' },
  SO: { sigla: 'SO', nome: 'SEDEX com Ar Digital', descricao: 'SEDEX Convencional com AR Digital', categoria: 'EXPRESSO' },
  SQ: { sigla: 'SQ', nome: 'SEDEX', descricao: 'SEDEX Contrato Agência', categoria: 'EXPRESSO' },
  SR: { sigla: 'SR', nome: 'SEDEX', descricao: 'SEDEX Convencional', categoria: 'EXPRESSO' },
  SS: { sigla: 'SS', nome: 'SEDEX Físico', descricao: 'SEDEX Físico', categoria: 'EXPRESSO' },
  SX: { sigla: 'SX', nome: 'SEDEX 10', descricao: 'SEDEX 10 Encomenda Expressa', categoria: 'EXPRESSO' },
  SZ: { sigla: 'SZ', nome: 'SEDEX Agência', descricao: 'SEDEX Agência Convencional', categoria: 'EXPRESSO' },
  QB: { sigla: 'QB', nome: 'SEDEX Contrato', descricao: 'SEDEX Contrato Corporativo', categoria: 'EXPRESSO' },
  QC: { sigla: 'QC', nome: 'SEDEX Contrato', descricao: 'SEDEX Contrato Agência', categoria: 'EXPRESSO' },
  QD: { sigla: 'QD', nome: 'SEDEX Contrato', descricao: 'SEDEX com Aviso de Recebimento', categoria: 'EXPRESSO' },
  QE: { sigla: 'QE', nome: 'SEDEX Contrato', descricao: 'SEDEX Encomenda Expressa PJ', categoria: 'EXPRESSO' },

  // PAC
  PA: { sigla: 'PA', nome: 'PAC', descricao: 'PAC Encomenda Econômica', categoria: 'ECONOMICO' },
  PB: { sigla: 'PB', nome: 'PAC', descricao: 'PAC Encomenda Econômica Agência', categoria: 'ECONOMICO' },
  PC: { sigla: 'PC', nome: 'PAC', descricao: 'PAC a Cobrar', categoria: 'ECONOMICO' },
  PD: { sigla: 'PD', nome: 'PAC', descricao: 'PAC Encomenda PJ', categoria: 'ECONOMICO' },
  PE: { sigla: 'PE', nome: 'PAC', descricao: 'PAC Encomenda Convencional', categoria: 'ECONOMICO' },
  PF: { sigla: 'PF', nome: 'PAC', descricao: 'PAC Comercial', categoria: 'ECONOMICO' },
  PG: { sigla: 'PG', nome: 'PAC', descricao: 'PAC Grandes Clientes', categoria: 'ECONOMICO' },
  PI: { sigla: 'PI', nome: 'PAC', descricao: 'PAC Industrial', categoria: 'ECONOMICO' },
  PJ: { sigla: 'PJ', nome: 'PAC', descricao: 'PAC Agência PJ', categoria: 'ECONOMICO' },
  PK: { sigla: 'PK', nome: 'PAC', descricao: 'PAC Extra', categoria: 'ECONOMICO' },
  PL: { sigla: 'PL', nome: 'PAC', descricao: 'PAC Logística', categoria: 'ECONOMICO' },
  PN: { sigla: 'PN', nome: 'PAC', descricao: 'PAC Não Urgente', categoria: 'ECONOMICO' },
  PR: { sigla: 'PR', nome: 'PAC', descricao: 'PAC Reversa', categoria: 'LOGISTICA_REVERSA' },

  // Mini Envios
  NM: { sigla: 'NM', nome: 'Correios Mini Envios', descricao: 'Mini Envios (Pequenas Encomendas)', categoria: 'ECONOMICO' },
  NX: { sigla: 'NX', nome: 'Correios Mini Envios', descricao: 'Mini Envios com código rastreado', categoria: 'ECONOMICO' },

  // Internacional
  LX: { sigla: 'LX', nome: 'Packet Standard', descricao: 'Importação / Packet Standard Importação', categoria: 'INTERNACIONAL' },
  NL: { sigla: 'NL', nome: 'Packet Standard / Prime', descricao: 'Objeto Internacional / Packet Standard', categoria: 'INTERNACIONAL' },
  NB: { sigla: 'NB', nome: 'Packet Standard', descricao: 'Objeto Internacional Importação', categoria: 'INTERNACIONAL' },
  NC: { sigla: 'NC', nome: 'Packet Standard', descricao: 'Objeto Internacional Rastreado', categoria: 'INTERNACIONAL' },
  ND: { sigla: 'ND', nome: 'Packet Express', descricao: 'Objeto Internacional Express', categoria: 'INTERNACIONAL' },
  NE: { sigla: 'NE', nome: 'Packet Express', descricao: 'Objeto Internacional Express', categoria: 'INTERNACIONAL' },
  NK: { sigla: 'NK', nome: 'Packet Standard', descricao: 'Objeto Internacional da China/Ásia', categoria: 'INTERNACIONAL' },
  AA: { sigla: 'AA', nome: 'Objeto Internacional', descricao: 'Encomenda Aérea Internacional', categoria: 'INTERNACIONAL' },
  EA: { sigla: 'EA', nome: 'EMS Express Mail', descricao: 'EMS Internacional com máxima urgência', categoria: 'INTERNACIONAL' },
  EB: { sigla: 'EB', nome: 'EMS Express Mail', descricao: 'EMS Encomenda Expressa Internacional', categoria: 'INTERNACIONAL' },
  EE: { sigla: 'EE', nome: 'EMS Express Mail', descricao: 'EMS Internacional Rastreado', categoria: 'INTERNACIONAL' },
  EH: { sigla: 'EH', nome: 'EMS Express Mail', descricao: 'EMS Internacional Prioritário', categoria: 'INTERNACIONAL' },
  EM: { sigla: 'EM', nome: 'EMS Express Mail', descricao: 'EMS Encomenda Internacional Mercadoria', categoria: 'INTERNACIONAL' },
  LA: { sigla: 'LA', nome: 'Logística Reversa Internacional', descricao: 'Linha Expressa Internacional Reversa', categoria: 'INTERNACIONAL' },
  LB: { sigla: 'LB', nome: 'Logística Reversa Internacional', descricao: 'Linha Expressa Internacional Reversa', categoria: 'INTERNACIONAL' },
  LD: { sigla: 'LD', nome: 'Packet Standard', descricao: 'Objeto Internacional Pequeno Pacote', categoria: 'INTERNACIONAL' },
  LE: { sigla: 'LE', nome: 'Packet Standard', descricao: 'Pequena Encomenda Internacional', categoria: 'INTERNACIONAL' },
  LF: { sigla: 'LF', nome: 'Packet Standard', descricao: 'Prime Internacional com Rastreamento Completo', categoria: 'INTERNACIONAL' },
  LH: { sigla: 'LH', nome: 'Packet Standard', descricao: 'Packet Standard Pequenos Volumes', categoria: 'INTERNACIONAL' },
  LP: { sigla: 'LP', nome: 'Packet Standard', descricao: 'Packet Standard Internacional Prioritário', categoria: 'INTERNACIONAL' },
  LZ: { sigla: 'LZ', nome: 'Packet Standard', descricao: 'Objeto Internacional Rastreado', categoria: 'INTERNACIONAL' },

  // Logística Reversa & Outros
  RL: { sigla: 'RL', nome: 'Logística Reversa', descricao: 'Logística Reversa de Encomenda', categoria: 'LOGISTICA_REVERSA' },
  EC: { sigla: 'EC', nome: 'Encomenda Comum', descricao: 'Encomenda Convencional', categoria: 'ECONOMICO' },
  ES: { sigla: 'ES', nome: 'Encomenda e-SEDEX', descricao: 'e-SEDEX Encomenda Expressa para Comércio Eletrônico', categoria: 'EXPRESSO' },
  JG: { sigla: 'JG', nome: 'Registrado Agência', descricao: 'Carta Registrada Grandes Usuários', categoria: 'OUTROS' },
  JR: { sigla: 'JR', nome: 'Registrado Reversa', descricao: 'Carta Registrada Logística Reversa', categoria: 'LOGISTICA_REVERSA' },
  OA: { sigla: 'OA', nome: 'SEDEX Contrato', descricao: 'SEDEX Grandes Volumes Contrato', categoria: 'EXPRESSO' },
  OC: { sigla: 'OC', nome: 'SEDEX Contrato', descricao: 'SEDEX Corporativo Agência', categoria: 'EXPRESSO' },
};

export class SiglasService {
  public static getSiglaInfo(codigoOuSigla: string): ServiceSiglaInfo {
    const clean = codigoOuSigla.trim().toUpperCase();
    const sigla = clean.slice(0, 2);

    if (SIGLAS_CORREIOS[sigla]) {
      return SIGLAS_CORREIOS[sigla];
    }

    // Default fallback based on initial letter
    const firstLetter = sigla[0];
    if (firstLetter === 'S' || firstLetter === 'Q' || firstLetter === 'O') {
      return { sigla, nome: 'SEDEX (Express)', descricao: `Serviço Expresso dos Correios (${sigla})`, categoria: 'EXPRESSO' };
    }
    if (firstLetter === 'P') {
      return { sigla, nome: 'PAC (Econômico)', descricao: `Serviço Econômico dos Correios (${sigla})`, categoria: 'ECONOMICO' };
    }
    if (firstLetter === 'N' || firstLetter === 'L' || firstLetter === 'E' || firstLetter === 'U' || firstLetter === 'R') {
      return { sigla, nome: 'Internacional / Packet', descricao: `Objeto Internacional / Importação (${sigla})`, categoria: 'INTERNACIONAL' };
    }

    return { sigla, nome: 'Objeto Correios', descricao: `Objeto registrado nos Correios (${sigla})`, categoria: 'OUTROS' };
  }

  public static listAll(): Record<string, ServiceSiglaInfo> {
    return SIGLAS_CORREIOS;
  }
}
