import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number(),
  CSRF_SECRET: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  NODE_ENV: z.string().default('development'),
  COOKIE_DOMAIN: z.string().optional(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_FROM_EMAIL: z.string(),
  SMTP_FROM_NAME: z.string(),
  SMTP_SECURE: z.string().default('false'),
  MAIN_FRONTEND_HOST: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  REDIS_SERVER_URL: z.string(),
});

export type EnvType = z.infer<typeof envSchema>;

const { success, error, data } = envSchema.safeParse(process.env);

if (!success) {
  throw new Error(error.message);
}

export const ENV = data;
