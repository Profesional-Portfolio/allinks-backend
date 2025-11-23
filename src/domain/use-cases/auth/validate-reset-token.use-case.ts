import { BadRequestException, Exception } from '@/domain/exceptions';
import { AuthRepository } from '@/domain/repositories';

export interface IValidateResetTokenUseCase {
  execute(token: string): Promise<[Exception | undefined, string | null]>;
}

export class ValidateResetTokenUseCase implements IValidateResetTokenUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(
    token: string
  ): Promise<[Exception | undefined, string | null]> {
    const [exception, tokenEntity] =
      await this.authRepository.findPasswordResetToken(token);

    if (!tokenEntity) {
      return [exception, null];
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
