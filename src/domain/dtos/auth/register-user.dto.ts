import { z } from 'zod';

export const registerUserDto = z.object({
  email: z.email(),
  password: z.string().min(8),
  username: z.string().min(3).max(50),
  first_name: z.string().max(100),
  last_name: z.string().max(100),
  bio: z.string().max(500).optional(),
  avatar_url: z.url().optional(),
  is_active: z.boolean().default(true),
  email_verified: z.boolean().default(false),
});

export type RegisterUserDto = z.infer<typeof registerUserDto>;
