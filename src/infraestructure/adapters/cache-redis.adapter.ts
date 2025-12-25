import { ICacheService } from '@/domain/interfaces/index';
import { cacheClient } from '@/config/index';

export class CacheRedisAdapter implements ICacheService {
  async set(key: string, value: string): Promise<void> {
    await cacheClient.set(key, value);
  }

  async setWithTTL(key: string, value: string, ttl: number): Promise<void> {
    await cacheClient.set(key, value, {
      EX: ttl,
    });
  }

  async get(key: string): Promise<string | null> {
    return await cacheClient.get(key);
  }

  async del(key: string): Promise<void> {
    await cacheClient.del(key);
  }
}
