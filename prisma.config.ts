/* eslint-disable @typescript-eslint/no-floating-promises */
import { defineConfig, env } from 'prisma/config';

if (process.env.NODE_ENV !== 'production') {
  (async () => {
    await import('dotenv/config');
  })();
}

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    path: 'prisma/migrations',
  },
  schema: 'prisma/schema.prisma',
});
