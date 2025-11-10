import 'dotenv/config';
import { parse } from 'path';
import { z, ZodError } from 'zod';

interface EnvVard {
  PORT: number;
}

const envSchema = z.object({
  PORT: z.coerce.number(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(parsed.error.message);
}

export const ENV = parsed.data;
