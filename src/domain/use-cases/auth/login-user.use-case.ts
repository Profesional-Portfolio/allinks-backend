import { AuthRepository } from '../../repositories';
import { LoginUserDto } from '../../dtos';
import { TokenProvider, TokenPair } from '../../interfaces';
import { Exception } from '@/domain/exceptions';
import { CacheService } from '@/infraestructure/services/cache.service';

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
      id: user.id,
      email: user.email,
    });

    if (err) {
      return [err, null];
    }

    // Almacenar el refresh token en Redis
    await this.cacheService.setRefreshToken(user.id, tokens.refreshToken);

    return [
      undefined,
      {
        user,
        tokens,
      },
    ];
  }
}
