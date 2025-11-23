import { z } from 'zod';
import { emailDto } from '../shared';

export const forgotPasswordDto = z.object({
  email: emailDto.shape.email,
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordDto>;
