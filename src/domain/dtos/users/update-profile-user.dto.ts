import { z } from 'zod';

export const updateProfileUserDto = z.object({
  username: z.string().min(3).max(20).trim().optional(),
  bio: z.string().max(1000).trim().optional(),
  first_name: z.string().max(100).trim().optional(),
  last_name: z.string().max(100).trim().optional(),
});

export type UpdateProfileUserDto = z.infer<typeof updateProfileUserDto>;
