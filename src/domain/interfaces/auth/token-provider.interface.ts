import { Exception } from '@/domain/exceptions';

export interface TokenPayload {
  userId: string;
  email: string;
  [key: string]: unknown;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenProvider {
  generateAccessToken(
    payload: TokenPayload
  ): Promise<[Exception | undefined, string]>;
  generateRefreshToken(
    payload: TokenPayload
  ): Promise<[Exception | undefined, string]>;
  generateTokenPair(
    payload: TokenPayload
  ): Promise<[Exception | undefined, TokenPair]>;
  verifyAccessToken(
    token: string
  ): Promise<[Exception | undefined, TokenPayload]>;
  verifyRefreshToken(
    token: string
  ): Promise<[Exception | undefined, TokenPayload]>;
}
