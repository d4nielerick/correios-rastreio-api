import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { trackingCache } from '../services/cache.service.js';
import { MonitorService } from '../services/monitor.service.js';
import { SiglasService } from '../services/siglas.service.js';
import { StorageService } from '../services/storage.service.js';
import { TrackerService } from '../services/tracker.service.js';

export const trackingRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // GET /api/v1/rastreio/:codigo
  app.get('/api/v1/rastreio/:codigo', async (request, reply) => {
    const paramsSchema = z.object({
      codigo: z.string().min(1).max(30),
    });

    const querySchema = z.object({
      nocache: z
        .string()
        .optional()
        .transform((val) => val === 'true' || val === '1'),
      apelido: z.string().optional(),
    });

    const parsedParams = paramsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.status(400).send({
        sucesso: false,
        erro: 'Código de rastreio inválido',
        detalhes: parsedParams.error.issues,
      });
    }

    const parsedQuery = querySchema.safeParse(request.query);
    const bypassCache = parsedQuery.success ? parsedQuery.data.nocache : false;
    const apelido = parsedQuery.success ? parsedQuery.data.apelido : undefined;

    const result = await TrackerService.track(parsedParams.data.codigo, bypassCache, apelido);
    return reply.status(200).send(result);
  });

  // POST /api/v1/rastreio/multi
  app.post('/api/v1/rastreio/multi', async (request, reply) => {
    const bodySchema = z.object({
      codigos: z.array(z.string().min(1).max(30)).min(1).max(50),
      nocache: z.boolean().optional().default(false),
    });

    const parsedBody = bodySchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.status(400).send({
        sucesso: false,
        erro: 'O corpo da requisição deve conter um array "codigos" com até 50 itens.',
        detalhes: parsedBody.error.issues,
      });
    }

    const result = await TrackerService.trackMultiple(
      parsedBody.data.codigos,
      parsedBody.data.nocache
    );

    return reply.status(200).send(result);
  });

  // GET /api/v1/historico
  app.get('/api/v1/historico', async (_request, reply) => {
    const historico = StorageService.getHistorico();
    return reply.send({
      sucesso: true,
      total: historico.length,
      historico,
    });
  });

  // DELETE /api/v1/historico
  app.delete('/api/v1/historico', async (_request, reply) => {
    StorageService.clearHistorico();
    return reply.send({
      sucesso: true,
      mensagem: 'Histórico de consultas limpo com sucesso.',
    });
  });

  // --- Monitoramento e Notificações (Webhooks) ---

  // GET /api/v1/monitorar
  app.get('/api/v1/monitorar', async (_request, reply) => {
    const monitorados = StorageService.getMonitorados();
    return reply.send({
      sucesso: true,
      total: monitorados.length,
      monitorados,
    });
  });

  // POST /api/v1/monitorar
  app.post('/api/v1/monitorar', async (request, reply) => {
    const bodySchema = z.object({
      codigo: z.string().min(1).max(30),
      apelido: z.string().optional(),
      webhookUrl: z.string().url().optional(),
      notificarNavegador: z.boolean().optional().default(true),
    });

    const parsed = bodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        sucesso: false,
        erro: 'Dados inválidos para monitoramento.',
        detalhes: parsed.error.issues,
      });
    }

    const { codigo, apelido, webhookUrl, notificarNavegador } = parsed.data;
    const pkg = await MonitorService.registerPackage(codigo, apelido, webhookUrl, notificarNavegador);

    return reply.status(201).send({
      sucesso: true,
      mensagem: `Pacote ${pkg.codigo} adicionado ao monitoramento de notificações.`,
      pacote: pkg,
    });
  });

  // DELETE /api/v1/monitorar/:codigo
  app.delete('/api/v1/monitorar/:codigo', async (request, reply) => {
    const params = request.params as { codigo: string };
    const removed = StorageService.removeMonitorado(params.codigo);
    if (!removed) {
      return reply.status(404).send({
        sucesso: false,
        erro: 'Pacote não encontrado na lista de monitoramento.',
      });
    }

    return reply.send({
      sucesso: true,
      mensagem: `Pacote ${params.codigo.toUpperCase()} removido do monitoramento.`,
    });
  });

  // POST /api/v1/monitorar/verificar (trigger manual)
  app.post('/api/v1/monitorar/verificar', async (_request, reply) => {
    const status = await MonitorService.checkAllMonitored();
    return reply.send({
      sucesso: true,
      mensagem: 'Verificação de pacotes monitorados concluída.',
      ...status,
    });
  });

  // GET /api/v1/servicos
  app.get('/api/v1/servicos', async (_request, reply) => {
    const siglas = SiglasService.listAll();
    return reply.send({
      sucesso: true,
      total: Object.keys(siglas).length,
      servicos: siglas,
    });
  });

  // GET /api/v1/servicos/:sigla
  app.get('/api/v1/servicos/:sigla', async (request, reply) => {
    const params = request.params as { sigla: string };
    const siglaInfo = SiglasService.getSiglaInfo(params.sigla);
    return reply.send({
      sucesso: true,
      servico: siglaInfo,
    });
  });

  // Cache stats & clear
  app.get('/api/v1/cache/stats', async (_request, reply) => {
    return reply.send({
      sucesso: true,
      cache: trackingCache.stats(),
    });
  });

  app.delete('/api/v1/cache/:codigo', async (request, reply) => {
    const params = request.params as { codigo: string };
    trackingCache.del(params.codigo);
    return reply.send({
      sucesso: true,
      mensagem: `Cache para o código ${params.codigo.toUpperCase()} foi limpo.`,
    });
  });
};
