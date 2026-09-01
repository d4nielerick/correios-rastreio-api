import cors from '@fastify/cors';
import fastify, { FastifyInstance } from 'fastify';
import { INDEX_HTML } from './constants/html.js';
import { healthRoutes } from './routes/health.routes.js';
import { trackingRoutes } from './routes/tracking.routes.js';

export function buildApp(): FastifyInstance {
  const isTest = process.env.NODE_ENV === 'test';

  const app = fastify({
    logger: isTest
      ? false
      : {
          level: 'info',
        },
  });

  // Enable CORS for all origins
  app.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  });

  // Explicit route for root UI and index.html with embedded HTML
  app.get('/', async (_request, reply) => {
    return reply.type('text/html; charset=utf-8').send(INDEX_HTML);
  });

  app.get('/index.html', async (_request, reply) => {
    return reply.type('text/html; charset=utf-8').send(INDEX_HTML);
  });

  app.get('/api/index', async (_request, reply) => {
    return reply.type('text/html; charset=utf-8').send(INDEX_HTML);
  });

  // Register API Routes
  app.register(trackingRoutes);
  app.register(healthRoutes);

  // Fallback for not found
  app.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send({
      sucesso: false,
      erro: 'Rota não encontrada',
    });
  });

  return app;
}
