import { Exception } from '@/domain/exceptions';
import { TokenProvider, TokenPair } from '../../interfaces';
import { CacheService } from '@/infraestructure/services/cache.service';

export class RefreshTokenUseCase {
  constructor(
    private readonly tokenProvider: TokenProvider,
    private readonly cacheService: CacheService
  ) {}

  async execute(
    refreshToken: string
  ): Promise<[Exception | undefined, TokenPair]> {
    const [err, payload] =
      await this.tokenProvider.verifyRefreshToken(refreshToken);

    if (err) {
      return [err, {} as TokenPair];
    }

    // Validar el refresh token contra Redis
    const storedToken = await this.cacheService.getRefreshToken(payload.id);

    if (!storedToken || storedToken !== refreshToken) {
      const exception = new Exception(
        'Invalid refresh token or session expired',
        401
      );
      return [exception, {} as TokenPair];
    }

    const [error, tokens] = await this.tokenProvider.generateTokenPair({
      id: payload.id,
      email: payload.email,
    });

    if (error) {
      return [error, {} as TokenPair];
    }

    // Actualizar el nuevo refresh token en Redis
    await this.cacheService.setRefreshToken(payload.id, tokens.refreshToken);

    return [undefined, tokens];
  }
}
