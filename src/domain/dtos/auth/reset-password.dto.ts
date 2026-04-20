import { z } from 'zod';

import { tokenDto } from '../shared';

export const resetPasswordDto = z
  .object({
    password: z.string().min(8).trim(),
    password_confirmation: z.string().min(8).trim(),
    token: tokenDto.shape.token,
  })
  .refine(data => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });

export type ResetPasswordDto = z.infer<typeof resetPasswordDto>;
