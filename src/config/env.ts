import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  NODE_ENV: z.string().default('development'),
  COOKIE_DOMAIN: z.string().optional(),
});

export type EnvType = z.infer<typeof envSchema>;

const { success, error, data } = envSchema.safeParse(process.env);

if (!success) {
  throw new Error(error.message);
}

export const ENV = data;
