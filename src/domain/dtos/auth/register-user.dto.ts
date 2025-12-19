import { z } from 'zod';
import { emailDto } from '../shared';

export const registerUserDto = z.object({
  email: emailDto.shape.email,
  password: z.string().min(8).trim(),
  username: z.string().min(3).max(50),
  first_name: z.string().max(100),
  last_name: z.string().max(100),
  bio: z.string().max(500).optional(),
  avatar_url: z.url().optional(),
  is_active: z.boolean().default(true).optional(),
  email_verified: z.boolean().default(false).optional(),
});

export type RegisterUserDto = z.infer<typeof registerUserDto>;
