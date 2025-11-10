import { z } from 'zod';

export const loginUseDto = z.object({
  email: z.email(),
  password: z.string(),
});

export type LoginUserDto = z.infer<typeof loginUseDto>;
