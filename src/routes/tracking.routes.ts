import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { trackingCache } from '../services/cache.service.js';
import { SiglasService } from '../services/siglas.service.js';
import { TrackerService } from '../services/tracker.service.js';

export const trackingRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // Schema for GET /api/v1/rastreio/:codigo
  app.get('/api/v1/rastreio/:codigo', async (request, reply) => {
    const paramsSchema = z.object({
      codigo: z.string().min(1).max(30),
    });

    const querySchema = z.object({
      nocache: z
        .string()
        .optional()
        .transform((val) => val === 'true' || val === '1'),
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

    const result = await TrackerService.track(parsedParams.data.codigo, bypassCache);
    return reply.status(200).send(result);
  });

  // Schema for POST /api/v1/rastreio/multi
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
