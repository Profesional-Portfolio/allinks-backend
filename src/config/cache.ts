import { createClient, RedisClientType } from 'redis';

import { ENV } from './env';

export const cacheClient: RedisClientType = createClient({
  url: ENV.REDIS_SERVER_URL,
});
