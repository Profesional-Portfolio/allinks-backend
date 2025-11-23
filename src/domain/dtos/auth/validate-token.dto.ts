import { z } from 'zod';
import { tokenDto } from '../shared';

export const validateTokenDto = z.object({
  token: tokenDto.shape.token,
});

export type ValidateTokenDto = z.infer<typeof validateTokenDto>;
