import { AuthRepository } from '../../repositories';
import { RegisterUserDto } from '../../dtos';
import { TokenProvider, TokenPair } from '../../interfaces';
import { Exception } from '@/domain/exceptions';
import { UserWithoutPassword } from '@/domain/entities';
import { CacheService } from '@/infraestructure/services/cache.service';

interface RegisterUserResponse {
  user: UserWithoutPassword;
  tokens: TokenPair;
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
      id: user.id,
      email: user.email,
    });

    if (err) {
      return [err, {} as RegisterUserResponse];
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
