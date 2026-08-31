import { FastifyInstance, FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  const startTime = Date.now();

  app.get('/health', async (_request, reply) => {
    const memory = process.memoryUsage();
    return reply.send({
      status: 'ok',
      service: 'correios-rastreio-api',
      version: '1.0.0',
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      memoryMb: {
        rss: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
        heapUsed: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotal: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
      },
      timestamp: new Date().toISOString(),
    });
  });
};
