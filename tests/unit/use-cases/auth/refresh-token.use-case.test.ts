import { RefreshTokenUseCase } from '@/domain/use-cases/auth/refresh-token.use-case';

import { mockCacheService, mockTokenProvider } from '../../../__mocks__';

describe('RefreshTokenUseCase', () => {
  let refreshTokenUseCase: RefreshTokenUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    refreshTokenUseCase = new RefreshTokenUseCase(
      mockTokenProvider,
      mockCacheService as any
    );
  });

  describe('execute', () => {
    const mockPayload = { email: 'test@test.com', id: 'user-123' };
    const mockTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    it('should refresh tokens successfully', async () => {
      mockTokenProvider.verifyRefreshToken.mockResolvedValue([
        undefined,
        mockPayload as any,
      ]);
      mockCacheService.getRefreshToken.mockResolvedValue('old-refresh-token');
      mockTokenProvider.generateTokenPair.mockResolvedValue([
        undefined,
        mockTokens,
      ]);
      mockCacheService.setRefreshToken.mockResolvedValue(undefined);

      const [error, tokens] =
        await refreshTokenUseCase.execute('old-refresh-token');

      expect(error).toBeUndefined();
      expect(tokens).toEqual(mockTokens);
      expect(mockCacheService.setRefreshToken).toHaveBeenCalledWith(
        'user-123',
        mockTokens.refreshToken
      );
    });

    it('should return error if refresh token is invalid', async () => {
      mockTokenProvider.verifyRefreshToken.mockResolvedValue([
        { message: 'Invalid token', statusCode: 401 } as any,
        undefined as any,
      ]);

      const [error] = await refreshTokenUseCase.execute('invalid-token');

      expect(error).toBeDefined();
    });

    it('should return error if token is not in cache', async () => {
      mockTokenProvider.verifyRefreshToken.mockResolvedValue([
        undefined,
        mockPayload as any,
      ]);
      mockCacheService.getRefreshToken.mockResolvedValue(null);

      const [error] = await refreshTokenUseCase.execute('refresh-token');

      expect(error).toBeDefined();
      expect(error?.message).toBe('Invalid refresh token or session expired');
    });

    it('should return error if stored token does not match', async () => {
      mockTokenProvider.verifyRefreshToken.mockResolvedValue([
        undefined,
        mockPayload as any,
      ]);
      mockCacheService.getRefreshToken.mockResolvedValue('different-token');

      const [error] = await refreshTokenUseCase.execute('refresh-token');

      expect(error).toBeDefined();
      expect(error?.message).toBe('Invalid refresh token or session expired');
    });

    it('should return error if token generation fails', async () => {
      mockTokenProvider.verifyRefreshToken.mockResolvedValue([
        undefined,
        mockPayload as any,
      ]);
      mockCacheService.getRefreshToken.mockResolvedValue('refresh-token');
      mockTokenProvider.generateTokenPair.mockResolvedValue([
        { message: 'Generation failed', statusCode: 500 } as any,
        {} as any,
      ]);

      const [error] = await refreshTokenUseCase.execute('refresh-token');

      expect(error).toBeDefined();
    });
  });
});
