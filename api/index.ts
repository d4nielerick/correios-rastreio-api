import { buildApp } from '../src/app.js';

let appInstance: any = null;

async function getApp() {
  if (!appInstance) {
    appInstance = buildApp();
    await appInstance.ready();
  }
  return appInstance;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();

    // Normalize Vercel rewrite URL path
    if (req.url === '/api/index' || req.url === '/api/index/') {
      req.url = '/';
    } else if (req.url && req.url.startsWith('/api/index?')) {
      req.url = '/' + req.url.slice('/api/index'.length);
    } else if (req.url && req.url.startsWith('/api/index/')) {
      req.url = req.url.slice('/api/index'.length);
    }

    return await new Promise<void>((resolve, reject) => {
      res.on('finish', resolve);
      res.on('close', resolve);
      res.on('error', reject);
      app.server.emit('request', req, res);
    });
  } catch (err: any) {
    console.error('[Vercel Serverless Error]:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ sucesso: false, erro: err?.message || 'Internal Server Error' }));
    }
  }
}
