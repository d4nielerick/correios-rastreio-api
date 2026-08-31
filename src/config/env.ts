import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  cacheTtlMs: parseInt(process.env.CACHE_TTL_MS || '300000', 10), // 5 minutes
  cacheMaxItems: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10),
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '15000', 10),
  isDev: process.env.NODE_ENV !== 'production',
};
