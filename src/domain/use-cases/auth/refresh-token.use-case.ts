import { Exception } from '@/domain/exceptions';
import { TokenProvider, TokenPair } from '../../interfaces';

export class RefreshTokenUseCase {
  constructor(private readonly tokenProvider: TokenProvider) {}

  async execute(
    refreshToken: string
  ): Promise<[Exception | undefined, TokenPair]> {
    const [err, payload] =
      await this.tokenProvider.verifyRefreshToken(refreshToken);

    if (err) {
      return [err, {} as TokenPair];
    }

    const [error, tokens] = await this.tokenProvider.generateTokenPair({
      userId: payload.userId,
      email: payload.email,
    });

    if (error) {
      return [error, {} as TokenPair];
    }

    return [undefined, tokens];
  }
}
