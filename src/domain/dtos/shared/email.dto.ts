import { z } from 'zod';

export const emailDto = z.object({
  email: z.email().trim().toLowerCase().max(100),
});

export type EmailDto = z.infer<typeof emailDto>;
