import { z } from 'zod';

import { emailDto } from '../shared';

export const registerUserDto = z.object({
  avatar_url: z.url().optional(),
  bio: z.string().max(500).optional(),
  email: emailDto.shape.email,
  email_verified: z.boolean().default(false).optional(),
  first_name: z.string().max(100),
  is_active: z.boolean().default(true).optional(),
  last_name: z.string().max(100),
  password: z.string().min(8).trim(),
  username: z.string().min(3).max(50),
});

export type RegisterUserDto = z.infer<typeof registerUserDto>;
