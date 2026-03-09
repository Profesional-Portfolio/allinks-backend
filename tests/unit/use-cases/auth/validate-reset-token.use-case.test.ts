import { ValidateResetTokenUseCase } from '@/domain/use-cases/auth/validate-reset-token.use-case';
import { mockAuthRepository } from '../../../__mocks__';
import { BadRequestException } from '@/domain/exceptions';

describe('ValidateResetTokenUseCase', () => {
  let validateResetTokenUseCase: ValidateResetTokenUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    validateResetTokenUseCase = new ValidateResetTokenUseCase(mockAuthRepository);
  });

  const validToken = {
    id: 'token-id',
    user_id: 'user-123',
    token: 'valid-token',
    expires_at: new Date(Date.now() + 60 * 60 * 1000),
    used_at: null,
    created_at: new Date(),
    isExpired: () => false,
    isValid: () => true,
  };

  describe('execute', () => {
    it('should return success for a valid token', async () => {
      mockAuthRepository.findPasswordResetToken.mockResolvedValue([undefined, validToken]);

      const [error, result] = await validateResetTokenUseCase.execute('valid-token');

      expect(error).toBeUndefined();
      expect(result).toBe('Valid token');
    });

    it('should return error if token not found', async () => {
      mockAuthRepository.findPasswordResetToken.mockResolvedValue([undefined, null]);

      const [error, result] = await validateResetTokenUseCase.execute('nonexistent-token');

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error?.message).toBe('Invalid or expired reset token');
      expect(result).toBeNull();
    });

    it('should return error if token has already been used', async () => {
      const usedToken = { ...validToken, used_at: new Date() };
      mockAuthRepository.findPasswordResetToken.mockResolvedValue([undefined, usedToken]);

      const [error, result] = await validateResetTokenUseCase.execute('used-token');

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error?.message).toBe('This reset link has already been used');
      expect(result).toBeNull();
    });

    it('should return error if token has expired', async () => {
      const expiredToken = {
        ...validToken,
        isExpired: () => true,
      };
      mockAuthRepository.findPasswordResetToken.mockResolvedValue([undefined, expiredToken]);

      const [error, result] = await validateResetTokenUseCase.execute('expired-token');

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error?.message).toBe('This reset link has expired');
      expect(result).toBeNull();
    });
  });
});
