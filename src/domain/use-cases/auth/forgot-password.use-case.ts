import { ENV } from '@/config/env';
import { ForgotPasswordDto } from '@/domain/dtos';
import { Exception } from '@/domain/exceptions';
import { EmailService } from '@/domain/interfaces';
import { AuthRepository } from '@/domain/repositories';
import { EmailTemplates } from '@/infraestructure/templates/email.templates';
import { generateToken } from '@/infraestructure/utils';

export interface IForgotPasswordUseCase {
  execute(
    forgotPasswordDto: ForgotPasswordDto
  ): Promise<[Exception | undefined, string | null]>;
}

const successMessage =
  'If the email exists, a password reset link has been sent';

export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService
  ) {}

  async execute(
    forgotPasswordDto: ForgotPasswordDto
  ): Promise<[Exception | undefined, string | null]> {
    const { email } = forgotPasswordDto;

    const [exception, user] = await this.authRepository.findUserByEmail(email);

    if (!user) {
      return [exception, successMessage];
    }

    const { token, expires_at } = generateToken();

    await this.authRepository.deleteUserEmailVerificationTokens(user.id);

    await this.authRepository.createPasswordResetToken(
      user.id,
      token,
      expires_at
    );

    const resetLink = `${ENV.MAIN_FRONTEND_HOST}/reset-password?token=${token}`;

    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Reset Password',
      html: EmailTemplates.forgotPasswordEmail(user.first_name, resetLink),
      text: EmailTemplates.forgotPasswordEmailText(user.first_name, resetLink),
    });

    return [undefined, successMessage];
  }
}
