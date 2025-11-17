import { AuthRepository } from '../../repositories';
import { RegisterUserDto } from '../../dtos';
import { TokenProvider, TokenPair } from '../../interfaces';
import { Exception } from '@/domain/exceptions';
import { UserWithoutPassword } from '@/domain/entities';

interface RegisterUserResponse {
  user: UserWithoutPassword;
  tokens: TokenPair;
}

export class RegisterUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenProvider: TokenProvider
  ) {}

  async execute(
    dto: RegisterUserDto
  ): Promise<[Exception | undefined, RegisterUserResponse]> {
    const [error, user] = await this.authRepository.register(dto);

    if (error) {
      return [error, {} as RegisterUserResponse];
    }

    const [err, tokens] = await this.tokenProvider.generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    if (err) {
      return [err, {} as RegisterUserResponse];
    }

    return [
      undefined,
      {
        user,
        tokens,
      },
    ];
  }
}
