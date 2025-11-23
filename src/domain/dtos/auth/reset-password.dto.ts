import { z } from 'zod';
import { tokenDto } from '../shared';

export const resetPasswordDto = z.object({
  token: tokenDto.shape.token,
  password: z.string().min(8).trim(),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordDto>;
