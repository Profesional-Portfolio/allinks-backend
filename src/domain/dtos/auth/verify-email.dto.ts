import { z } from 'zod';
import { tokenDto } from '../shared';

export const verifyEmailDto = z.object({
  token: tokenDto.shape.token,
});

export type VerifyEmailDto = z.infer<typeof verifyEmailDto>;
