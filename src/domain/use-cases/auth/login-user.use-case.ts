import { AuthRepository } from '../../repositories';
import { LoginUserDto } from '../../dtos';
import { TokenProvider, TokenPair } from '../../interfaces';
import { Exception } from '@/domain/exceptions';

interface LoginUserResponse {
  user: {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  tokens: TokenPair;
}

export class LoginUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenProvider: TokenProvider
  ) {}

  async execute(
    dto: LoginUserDto
  ): Promise<[Exception | undefined, LoginUserResponse | null]> {
    const [error, user] = await this.authRepository.login(dto);

    if (error || !user) {
      return [error, null];
    }

    const [err, tokens] = await this.tokenProvider.generateTokenPair({
      id: user.id,
      email: user.email,
    });

    if (err) {
      return [err, null];
    }

    return [
      undefined,
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
        },
        tokens,
      },
    ];
  }
}
