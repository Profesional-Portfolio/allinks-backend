import { UserWithoutPassword } from '@/domain/entities';
import { Exception } from '@/domain/exceptions';
import { CacheService } from '@/infraestructure/services/cache.service';

import { RegisterUserDto } from '../../dtos';
import { TokenPair, TokenProvider } from '../../interfaces';
import { AuthRepository } from '../../repositories';

interface RegisterUserResponse {
  tokens: TokenPair;
  user: UserWithoutPassword;
}

export class RegisterUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenProvider: TokenProvider,
    private readonly cacheService: CacheService
  ) {}

  async execute(
    dto: RegisterUserDto
  ): Promise<[Exception | undefined, RegisterUserResponse]> {
    const [error, user] = await this.authRepository.register(dto);

    if (!user) {
      return [error, {} as RegisterUserResponse];
    }

    const [err, tokens] = await this.tokenProvider.generateTokenPair({
      email: user.email,
      id: user.id,
    });

    if (err) {
      return [err, {} as RegisterUserResponse];
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
