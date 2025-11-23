import { UserEntity } from '@/domain/entities';
import { AuthRepository } from '../../repositories/auth.repository';
import { EmailService } from '@/domain/interfaces';
import { EmailTemplates } from '@/infraestructure/templates/email.templates';
import { generateToken } from '@/infraestructure/utils';
import { ENV } from '@/config/env';

export interface ISendWelcomeEmailUseCase {
  execute(
    userId: UserEntity['id'],
    email: string,
    name: string
  ): Promise<boolean>;
}

export class SendWelcomeEmailUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService
  ) {}

  async execute(
    userId: UserEntity['id'],
    email: string,
    name: string
  ): Promise<boolean> {
    const { token: verificationToken, expires_at: expires_at } =
      generateToken();

    await this.authRepository.deleteUserEmailVerificationTokens(userId);

    await this.authRepository.createEmailVerificationToken(
      userId,
      verificationToken,
      expires_at
    );

    const verificationLink = `${ENV.MAIN_FRONTEND_HOST}/auth/verify-email?token=${verificationToken}`;

    const sent = await this.emailService.sendEmail({
      to: email,
      subject: '¡Bienvenido! Verifica tu cuenta',
      html: EmailTemplates.welcomeEmail(name, verificationLink),
      text: EmailTemplates.welcomeEmailText(name, verificationLink),
    });

    return sent;
  }
}
