import { z } from 'zod';

export const getProfileDto = z.object({
  username: z.string().min(3),
});

export type GetProfileDto = z.infer<typeof getProfileDto>;
