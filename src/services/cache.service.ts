import { LRUCache } from 'lru-cache';
import { config } from '../config/env.js';
import { TrackingResult } from '../types/tracking.types.js';

export class CacheService {
  private cache: LRUCache<string, TrackingResult>;
  private hits = 0;
  private misses = 0;

  constructor(ttlMs = config.cacheTtlMs, max = config.cacheMaxItems) {
    this.cache = new LRUCache<string, TrackingResult>({
      max,
      ttl: ttlMs,
    });
  }

  public get(codigo: string): TrackingResult | undefined {
    const key = codigo.toUpperCase().trim();
    const item = this.cache.get(key);
    if (item) {
      this.hits++;
      return { ...item, cache: true };
    }
    this.misses++;
    return undefined;
  }

  public set(codigo: string, result: TrackingResult, customTtlMs?: number): void {
    const key = codigo.toUpperCase().trim();
    // If the object was already delivered, we can cache it for longer (e.g. 24h)
    const effectiveTtl = result.entregue ? (customTtlMs || 24 * 60 * 60 * 1000) : customTtlMs;
    this.cache.set(key, { ...result, cache: false }, { ttl: effectiveTtl });
  }

  public del(codigo: string): void {
    const key = codigo.toUpperCase().trim();
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  public stats() {
    return {
      size: this.cache.size,
      max: this.cache.max,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(2) : '0.00',
    };
  }
}

export const trackingCache = new CacheService();
