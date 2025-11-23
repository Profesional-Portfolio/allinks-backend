import { ResetPasswordDto } from '@/domain/dtos';
import { BadRequestException, Exception } from '@/domain/exceptions';
import { EmailService, PasswordHasher } from '@/domain/interfaces';
import { AuthRepository } from '@/domain/repositories';
import { EmailTemplates } from '@/infraestructure/templates/email.templates';

export interface IResetPasswordUseCase {
  execute(
    resetPasswordDto: ResetPasswordDto
  ): Promise<[Exception | undefined, string | null]>;
}

export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly emailService: EmailService
  ) {}

  async execute(
    resetPasswordDto: ResetPasswordDto
  ): Promise<[Exception | undefined, string | null]> {
    const [exceptionPassworkToken, tokenEntity] =
      await this.authRepository.findPasswordResetToken(resetPasswordDto.token);

    if (!tokenEntity) {
      return [exceptionPassworkToken, null];
    }

    if (!tokenEntity.isValid()) {
      if (tokenEntity.used_at) {
        const err = new BadRequestException(
          'This reset link has already been used'
        );
        return [err, null];
      }
      if (tokenEntity.isExpired()) {
        const err = new BadRequestException('This reset link has expired');
        return [err, null];
      }
    }

    const [exceptionUser, user] = await this.authRepository.findUserById(
      tokenEntity.user_id
    );

    if (!user) {
      return [exceptionUser, null];
    }

    const hashedPassword = await this.passwordHasher.hash(
      resetPasswordDto.password
    );

    await this.authRepository.updatePassword(user.id, hashedPassword);

    await this.authRepository.updatePasswordResetTokenUsedDate(tokenEntity.id);

    await this.authRepository.deleteUserPasswordResetTokens(user.id);

    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Tu contraseña ha sido actualizada',
      html: EmailTemplates.passwordResetConfirmationEmail(user.first_name),
      text: EmailTemplates.passwordResetConfirmationEmailText(user.first_name),
    });

    return [undefined, 'Password updated'];
  }
}
