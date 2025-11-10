import jwt from 'jsonwebtoken';
import { TokenProvider, TokenPayload, TokenPair } from '@/domain/interfaces';
import { ENV } from '@/config/index';
import { UnauthorizedException } from '../http';

export class JwtTokenProviderAdapter implements TokenProvider {
  constructor(
    private readonly accessSecret: string = ENV.JWT_ACCESS_SECRET,
    private readonly refreshSecret: string = ENV.JWT_REFRESH_SECRET,
    private readonly accessExpiresIn: string = ENV.JWT_ACCESS_EXPIRES_IN,
    private readonly refreshExpiresIn: string = ENV.JWT_REFRESH_EXPIRES_IN
  ) {}

  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiresIn as any,
    });
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn as any,
    });
  }

  generateTokenPair(payload: TokenPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.accessSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.refreshSecret) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
