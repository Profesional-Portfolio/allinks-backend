import { createClient } from 'redis';
import { ENV } from './env';

export const cacheClient = createClient({
  url: ENV.REDIS_SERVER_URL,
});
