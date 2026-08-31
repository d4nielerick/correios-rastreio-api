import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import fastify, { FastifyInstance } from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import { healthRoutes } from './routes/health.routes.js';
import { trackingRoutes } from './routes/tracking.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function buildApp(): FastifyInstance {
  const isTest = process.env.NODE_ENV === 'test';

  const app = fastify({
    logger: isTest
      ? false
      : {
          level: 'info',
        },
  });

  // Enable CORS
  app.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  });

  // Serve static UI assets from public directory
  const publicPath = path.resolve(__dirname, 'public');
  app.register(fastifyStatic, {
    root: publicPath,
    prefix: '/',
    decorateReply: false,
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
