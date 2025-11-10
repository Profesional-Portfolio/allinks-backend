import { TokenProvider, TokenPair } from '../../interfaces';

export class RefreshTokenUseCase {
  constructor(private readonly tokenProvider: TokenProvider) {}

  async execute(refreshToken: string): Promise<TokenPair> {
    const payload = await this.tokenProvider.verifyRefreshToken(refreshToken);
    
    const tokens = await this.tokenProvider.generateTokenPair({
      userId: payload.userId,
      email: payload.email,
    });

    return tokens;
  }
}
