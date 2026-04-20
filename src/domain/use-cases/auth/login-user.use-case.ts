import { Exception } from '@/domain/exceptions';
import { CacheService } from '@/infraestructure/services/cache.service';

import { LoginUserDto } from '../../dtos';
import { TokenPair, TokenProvider } from '../../interfaces';
import { AuthRepository } from '../../repositories';

interface LoginUserResponse {
  tokens: TokenPair;
  user: {
    email: string;
    first_name: string;
    id: string;
    last_name: string;
    username: string;
  };
}

export class LoginUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenProvider: TokenProvider,
    private readonly cacheService: CacheService
  ) {}

  async execute(
    dto: LoginUserDto
  ): Promise<[Exception | undefined, LoginUserResponse | null]> {
    const [error, user] = await this.authRepository.login(dto);

    if (error || !user) {
      return [error, null];
    }

    const [err, tokens] = await this.tokenProvider.generateTokenPair({
      email: user.email,
      id: user.id,
    });

    if (err) {
      return [err, null];
    }

    // Almacenar el refresh token en Redis
    await this.cacheService.setRefreshToken(user.id, tokens.refreshToken);

    return [
      undefined,
      {
        tokens,
        user,
      },
    ];
  }
}
