import assert from 'node:assert/strict';
import test from 'node:test';
import { buildApp } from '../src/app.js';
import { CacheService } from '../src/services/cache.service.js';
import { SiglasService } from '../src/services/siglas.service.js';
import { StorageService } from '../src/services/storage.service.js';
import { TrackerService } from '../src/services/tracker.service.js';

test('TrackerService - Validação de códigos de rastreio', () => {
  assert.equal(TrackerService.isValidTrackingCode('NL123456789BR'), true);
  assert.equal(TrackerService.isValidTrackingCode('qb987654321br'), true);
  assert.equal(TrackerService.isValidTrackingCode('PA123456789BR'), true);
  assert.equal(TrackerService.isValidTrackingCode('INVALIDO'), false);
  assert.equal(TrackerService.isValidTrackingCode('12345678901'), false);
  assert.equal(TrackerService.isValidTrackingCode(''), false);
});

test('TrackerService - Limpeza e normalização de código', () => {
  assert.equal(TrackerService.cleanCode(' nl 123.456.789 br '), 'NL123456789BR');
});

test('TrackerService - Classificação de status', () => {
  assert.equal(TrackerService.categorizeStatus('Objeto entregue ao destinatário'), 'ENTREGUE');
  assert.equal(TrackerService.categorizeStatus('Objeto saiu para entrega ao destinatário'), 'SAIU_ENTREGA');
  assert.equal(TrackerService.categorizeStatus('Objeto em trânsito - por favor aguarde'), 'EM_TRANSITO');
  assert.equal(TrackerService.categorizeStatus('Objeto postado após o horário limite'), 'POSTADO');
  assert.equal(TrackerService.categorizeStatus('Aguardando pagamento de tributo aduaneiro'), 'TRIBUTADO');
  assert.equal(TrackerService.categorizeStatus('Objeto não localizado no fluxo postal'), 'NAO_ENCONTRADO');
});

test('SiglasService - Decodificação de prefixos dos Correios', () => {
  const nl = SiglasService.getSiglaInfo('NL');
  assert.equal(nl.categoria, 'INTERNACIONAL');

  const qb = SiglasService.getSiglaInfo('QB');
  assert.equal(qb.categoria, 'EXPRESSO');

  const pa = SiglasService.getSiglaInfo('PA');
  assert.equal(pa.categoria, 'ECONOMICO');
});

test('CacheService - Armazenamento e expiração', () => {
  const cache = new CacheService(1000, 10);
  const sampleResult: any = {
    codigo: 'NL123456789BR',
    sucesso: true,
    entregue: false,
    totalEventos: 1,
  };

  assert.equal(cache.get('NL123456789BR'), undefined);
  cache.set('NL123456789BR', sampleResult);

  const cached = cache.get('NL123456789BR');
  assert.ok(cached);
  assert.equal(cached.codigo, 'NL123456789BR');
  assert.equal(cached.cache, true);

  cache.del('NL123456789BR');
  assert.equal(cache.get('NL123456789BR'), undefined);
});

test('StorageService - Histórico e Monitoramento', () => {
  StorageService.clearHistorico();
  StorageService.addHistorico({
    codigo: 'NL123456789BR',
    apelido: 'Teste Encomenda',
    status: 'EM_TRANSITO',
    descricaoStatus: 'Em trânsito',
    servicoDescricao: 'Packet Standard',
    entregue: false,
    consultadoEm: new Date().toISOString(),
    totalEventos: 2,
  });

  const hist = StorageService.getHistorico();
  assert.ok(hist.length >= 1);
  assert.equal(hist[0].codigo, 'NL123456789BR');
});

test('Fastify App - Endpoints de Integração', async () => {
  const app = buildApp();

  // Test Health
  const healthRes = await app.inject({
    method: 'GET',
    url: '/health',
  });
  assert.equal(healthRes.statusCode, 200);
  assert.equal(healthRes.json().status, 'ok');

  // Test History endpoint
  const histRes = await app.inject({
    method: 'GET',
    url: '/api/v1/historico',
  });
  assert.equal(histRes.statusCode, 200);
  assert.equal(histRes.json().sucesso, true);

  // Test Siglas
  const siglaRes = await app.inject({
    method: 'GET',
    url: '/api/v1/servicos/SEDEX',
  });
  assert.equal(siglaRes.statusCode, 200);
  assert.equal(siglaRes.json().sucesso, true);

  // Test Monitoring registration
  const monRes = await app.inject({
    method: 'POST',
    url: '/api/v1/monitorar',
    payload: {
      codigo: 'NL123456789BR',
      apelido: 'Monitorado Teste',
      notificarNavegador: true,
    },
  });
  assert.equal(monRes.statusCode, 201);
  assert.equal(monRes.json().sucesso, true);

  await app.close();
});
