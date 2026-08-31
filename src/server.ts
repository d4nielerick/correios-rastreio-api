import { buildApp } from './app.js';
import { config } from './config/env.js';

async function startServer() {
  const app = buildApp();

  try {
    const address = await app.listen({ port: config.port, host: config.host });
    console.log(`
  🚀 Correios Tracker API iniciado com sucesso!
  📡 Servidor: ${address}
  🌐 Interface Web: http://localhost:${config.port}/
  📦 Endpoint Rastreio: http://localhost:${config.port}/api/v1/rastreio/:codigo
  💚 Health Check: http://localhost:${config.port}/health
    `);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startServer();
