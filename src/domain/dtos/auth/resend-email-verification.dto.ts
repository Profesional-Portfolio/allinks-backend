import { z } from 'zod';
import { emailDto } from '../shared';

export const resendEmailVerificationDto = z.object({
  email: emailDto.shape.email,
});

export type ResendEmailVerificationDto = z.infer<
  typeof resendEmailVerificationDto
>;
