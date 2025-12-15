import jwt from 'jsonwebtoken';
import { TokenProvider, TokenPayload, TokenPair } from '@/domain/interfaces';
import { ENV } from '@/config/index';
import { Exception } from '@/domain/exceptions';

export class JwtTokenProviderAdapter implements TokenProvider {
  constructor(
    private readonly accessSecret: string = ENV.JWT_ACCESS_SECRET,
    private readonly refreshSecret: string = ENV.JWT_REFRESH_SECRET,
    private readonly accessExpiresIn: string = ENV.JWT_ACCESS_EXPIRES_IN,
    private readonly refreshExpiresIn: string = ENV.JWT_REFRESH_EXPIRES_IN
  ) {}

  generateAccessToken(
    payload: TokenPayload
  ): Promise<[Exception | undefined, string]> {
    try {
      return Promise.resolve([
        undefined,
        jwt.sign(payload, this.accessSecret, {
          expiresIn: this.accessExpiresIn as any,
        }),
      ]);
    } catch (error) {
      const err = new Exception('Error generating access token', 500);
      return Promise.resolve([err, '']);
    }
  }

  generateRefreshToken(
    payload: TokenPayload
  ): Promise<[Exception | undefined, string]> {
    try {
      return Promise.resolve([
        undefined,
        jwt.sign(payload, this.refreshSecret, {
          expiresIn: this.refreshExpiresIn as any,
        }),
      ]);
    } catch (error) {
      const err = new Exception('Error generating refresh token', 500);
      return Promise.resolve([err, '']);
    }
  }

  async generateTokenPair(
    payload: TokenPayload
  ): Promise<[Exception | undefined, TokenPair]> {
    const [errorAccessToken, accessToken] =
      await this.generateAccessToken(payload);
    const [errorRefreshToken, refreshToken] =
      await this.generateRefreshToken(payload);
    if (errorAccessToken || errorRefreshToken) {
      return [errorAccessToken || errorRefreshToken, {} as TokenPair];
    }

    return [undefined, { accessToken, refreshToken }];
  }

  async verifyAccessToken(
    token: string
  ): Promise<[Exception | undefined, TokenPayload]> {
    try {
      const decoded = jwt.verify(token, this.accessSecret) as TokenPayload;
      return Promise.resolve([undefined, decoded]);
    } catch (error) {
      const err = new Exception('Invalid token', 401);
      return Promise.resolve([err, {} as TokenPayload]);
    }
  }

  async verifyRefreshToken(
    token: string
  ): Promise<[Exception | undefined, TokenPayload]> {
    try {
      const decoded = jwt.verify(token, this.refreshSecret) as TokenPayload;
      return Promise.resolve([undefined, decoded]);
    } catch (error) {
      const err = new Exception('Invalid token', 401);
      return Promise.resolve([err, {} as TokenPayload]);
    }
  }
}
