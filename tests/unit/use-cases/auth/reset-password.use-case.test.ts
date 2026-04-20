import { BadRequestException } from '@/domain/exceptions';
import { ResetPasswordUseCase } from '@/domain/use-cases/auth/reset-password.use-case';

import {
  mockAuthRepository,
  mockEmailService,
  mockPasswordHasher,
  mockUserWithoutPassword,
} from '../../../__mocks__';

describe('ResetPasswordUseCase', () => {
  let resetPasswordUseCase: ResetPasswordUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    resetPasswordUseCase = new ResetPasswordUseCase(
      mockAuthRepository,
      mockPasswordHasher,
      mockEmailService
    );
  });

  const mockToken = {
    created_at: new Date(),
    expires_at: new Date(Date.now() + 60 * 60 * 1000),
    id: 'token-id',
    isExpired: () => false,
    isValid: () => true,
    token: 'valid-token',
    used_at: null,
    user_id: 'user-123',
  };

  const resetDto = {
    password: 'NewPassword123!',
    password_confirmation: 'NewPassword123!',
    token: 'valid-token',
  };

  describe('execute', () => {
    it('should reset password successfully', async () => {
      mockAuthRepository.findPasswordResetToken.mockResolvedValue([
        undefined,
        mockToken,
      ]);
      mockAuthRepository.findUserById.mockResolvedValue([
        undefined,
        mockUserWithoutPassword,
      ]);
      mockPasswordHasher.hash.mockResolvedValue('hashed-new-password');
      mockAuthRepository.updatePassword.mockResolvedValue([
        undefined,
        undefined,
      ] as any);
      mockAuthRepository.updatePasswordResetTokenUsedDate.mockResolvedValue([
        undefined,
        undefined,
      ] as any);
      mockAuthRepository.deleteUserPasswordResetTokens.mockResolvedValue([
        undefined,
        undefined,
      ] as any);
      mockEmailService.sendEmail.mockResolvedValue(true);

      const [error, result] = await resetPasswordUseCase.execute(resetDto);

      expect(error).toBeUndefined();
      expect(result).toBe('Password updated');
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(resetDto.password);
      expect(mockAuthRepository.updatePassword).toHaveBeenCalledWith(
        mockUserWithoutPassword.id,
        'hashed-new-password'
      );
    });

    it('should return error if token not found', async () => {
      mockAuthRepository.findPasswordResetToken.mockResolvedValue([
        undefined,
        null,
      ]);

      const [error, result] = await resetPasswordUseCase.execute(resetDto);

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error?.message).toBe('Invalid or expired reset token');
      expect(result).toBeNull();
    });

    it('should return error if passwords do not match', async () => {
      mockAuthRepository.findPasswordResetToken.mockResolvedValue([
        undefined,
        mockToken,
      ]);

      const [error, result] = await resetPasswordUseCase.execute({
        ...resetDto,
        password_confirmation: 'DifferentPassword123!',
      });

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error?.message).toBe("Passwords don't match");
      expect(result).toBeNull();
    });

    it('should return error if token has been used', async () => {
      const usedToken = {
        ...mockToken,
        isValid: () => false,
        used_at: new Date(),
      };
      mockAuthRepository.findPasswordResetToken.mockResolvedValue([
        undefined,
        usedToken,
      ]);

      const [error, result] = await resetPasswordUseCase.execute(resetDto);

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error?.message).toBe('This reset link has already been used');
      expect(result).toBeNull();
    });

    it('should return error if token has expired', async () => {
      const expiredToken = {
        ...mockToken,
        isExpired: () => true,
        isValid: () => false,
        used_at: null,
      };
      mockAuthRepository.findPasswordResetToken.mockResolvedValue([
        undefined,
        expiredToken,
      ]);

      const [error, result] = await resetPasswordUseCase.execute(resetDto);

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error?.message).toBe('This reset link has expired');
      expect(result).toBeNull();
    });
  });
});
