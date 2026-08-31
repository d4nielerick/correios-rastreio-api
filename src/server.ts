import { buildApp } from './app.js';
import { config } from './config/env.js';
import { MonitorService } from './services/monitor.service.js';

async function startServer() {
  const app = buildApp();

  try {
    const address = await app.listen({ port: config.port, host: config.host });
    
    // Inicia o serviço de verificação em background (polling a cada 15 min)
    if (process.env.NODE_ENV !== 'test') {
      MonitorService.startScheduler(15 * 60 * 1000);
    }

    console.log(`
  🚀 Correios Tracker API iniciado com sucesso!
  📡 Servidor: ${address}
  🌐 Interface Web: http://localhost:${config.port}/
  📦 Endpoint Rastreio: http://localhost:${config.port}/api/v1/rastreio/:codigo
  🕒 Histórico: http://localhost:${config.port}/api/v1/historico
  🔔 Monitoramento & Webhooks: http://localhost:${config.port}/api/v1/monitorar
  💚 Health Check: http://localhost:${config.port}/health
    `);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startServer();
