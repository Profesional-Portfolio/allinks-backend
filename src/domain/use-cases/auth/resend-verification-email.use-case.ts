import { AuthRepository } from '@/domain/repositories';
import { ResendEmailVerificationDto } from '@/domain/dtos';
import { EmailService } from '@/domain/interfaces';
import { SendWelcomeEmailUseCase } from './send-welcome-email.use-case';
import { Exception } from '@/domain/exceptions';

export interface IResendVerificationEmailUseCase {
  execute(
    dto: ResendEmailVerificationDto
  ): Promise<[Exception | undefined, string | null]>;
}

const successMessage =
  'If the email exists, a verification email has been sent';

export class ResendVerificationEmailUseCase
  implements IResendVerificationEmailUseCase
{
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sendWelcomeEmailUseCase: SendWelcomeEmailUseCase
  ) {}

  async execute(
    dto: ResendEmailVerificationDto
  ): Promise<[Exception | undefined, string | null]> {
    const [exception, user] = await this.authRepository.findUserByEmail(
      dto.email
    );

    if (!user) {
      return [exception, successMessage];
    }

    if (user.email_verified) {
      return [undefined, successMessage];
    }

    await this.sendWelcomeEmailUseCase.execute(
      user.id,
      user.email,
      user.first_name
    );

    return [undefined, successMessage];
  }
}
