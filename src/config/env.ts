import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  COOKIE_DOMAIN: z.string().optional(),
  CSRF_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string(),
  MAIN_FRONTEND_HOST: z.string().optional(),
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number(),
  REDIS_SERVER_URL: z.string(),
  SMTP_FROM_EMAIL: z.string(),
  SMTP_FROM_NAME: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_PORT: z.string(),
  SMTP_SECURE: z.string().default('false'),
  SMTP_USER: z.string(),
});

export type EnvType = z.infer<typeof envSchema>;

const { data, error, success } = envSchema.safeParse(process.env);

if (!success) {
  throw new Error(error.message);
}

export const ENV = data;
