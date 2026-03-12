import { cacheClient } from '@/config/index';
import { ICacheService } from '@/domain/interfaces/index';

export class CacheRedisAdapter implements ICacheService {
  async del(key: string): Promise<void> {
    await cacheClient.del(key);
  }

  async get(key: string): Promise<string> {
    return (await cacheClient.get(key)) as unknown as string;
  }

  async set(key: string, value: string): Promise<void> {
    await cacheClient.set(key, value);
  }

  async setWithTTL(key: string, value: string, ttl: number): Promise<void> {
    await cacheClient.set(key, value, {
      EX: ttl,
    });
  }
}
