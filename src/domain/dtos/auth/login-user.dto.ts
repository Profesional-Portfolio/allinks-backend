import { z } from 'zod';
import { emailDto } from '../shared';

export const loginUseDto = z.object({
  email: emailDto.shape.email,
  password: z.string(),
});

export type LoginUserDto = z.infer<typeof loginUseDto>;
