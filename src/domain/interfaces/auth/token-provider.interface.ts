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
  generateAccessToken(payload: TokenPayload): Promise<string> | string;
  generateRefreshToken(payload: TokenPayload): Promise<string> | string;
  generateTokenPair(payload: TokenPayload): Promise<TokenPair> | TokenPair;
  verifyAccessToken(token: string): Promise<TokenPayload> | TokenPayload;
  verifyRefreshToken(token: string): Promise<TokenPayload> | TokenPayload;
}
