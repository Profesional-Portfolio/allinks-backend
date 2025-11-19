import { z } from 'zod';

export const idDto = z.object({
  id: z.string(),
});

export const userIdDto = z.object({
  user_id: z.string(),
});

export type IdDto = z.infer<typeof idDto>;
export type UserIdDto = z.infer<typeof userIdDto>;
