import { BadRequestException, Exception } from '@/domain/exceptions';
import { AuthRepository } from '@/domain/repositories';

import { VerifyEmailDto } from '../../dtos/auth/verify-email.dto';

export interface IVerifyEmailUseCase {
  execute(dto: VerifyEmailDto): Promise<[Exception | undefined, null | string]>;
}

export class VerifyEmailUseCase implements IVerifyEmailUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(
    dto: VerifyEmailDto
  ): Promise<[Exception | undefined, null | string]> {
    const [exception, tokenEntity] =
      await this.authRepository.findEmailVerificationToken(dto.token);

    if (!tokenEntity) {
      return [exception, null];
    }

    if (!tokenEntity.isValid()) {
      const err = new BadRequestException('Invalid token');
      return [err, null];
    }

    await this.authRepository.updateEmailVerified(tokenEntity.user_id, true);

    await this.authRepository.updateEmailVerificationTokenVerifiedDate(
      tokenEntity.id
    );

    return [undefined, 'Email verified'];
  }
}
