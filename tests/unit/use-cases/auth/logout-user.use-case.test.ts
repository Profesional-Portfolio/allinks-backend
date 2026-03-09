import { LogoutUserUseCase } from '@/domain/use-cases/auth/logout-user.use-case';
import { mockCacheService } from '../../../__mocks__';

describe('LogoutUserUseCase', () => {
  let logoutUserUseCase: LogoutUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    logoutUserUseCase = new LogoutUserUseCase(mockCacheService as any);
  });

  describe('execute', () => {
    it('should logout user successfully', async () => {
      mockCacheService.deleteRefreshToken.mockResolvedValue(undefined);

      const [error, result] = await logoutUserUseCase.execute('user-123');

      expect(error).toBeUndefined();
      expect(result).toBe('Logged out successfully');
      expect(mockCacheService.deleteRefreshToken).toHaveBeenCalledWith('user-123');
    });

    it('should return error if cache throws', async () => {
      mockCacheService.deleteRefreshToken.mockRejectedValue(new Error('Cache error'));

      const [error, result] = await logoutUserUseCase.execute('user-123');

      expect(error).toBeDefined();
      expect(error?.message).toBe('Error during logout');
      expect(result).toBe('');
    });
  });
});
