import { z } from 'zod';

export const tokenDto = z.object({
  token: z.string().min(1),
});

export type TokenDto = z.infer<typeof tokenDto>;
