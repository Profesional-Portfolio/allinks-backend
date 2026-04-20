import { BadRequestException, Exception } from '@/domain/exceptions';
import { AuthRepository } from '@/domain/repositories';

export interface IValidateResetTokenUseCase {
  execute(token: string): Promise<[Exception | undefined, null | string]>;
}

export class ValidateResetTokenUseCase implements IValidateResetTokenUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(
    token: string
  ): Promise<[Exception | undefined, null | string]> {
    const [, tokenEntity] =
      await this.authRepository.findPasswordResetToken(token);

    if (!tokenEntity) {
      const err = new BadRequestException('Invalid or expired reset token');
      return [err, null];
    }

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

    return [undefined, 'Valid token'];
  }
}
