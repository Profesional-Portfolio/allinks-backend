import { BadRequestException } from '@/domain/exceptions';
import { VerifyEmailUseCase } from '@/domain/use-cases/auth/verify-email.use-case';

import { mockAuthRepository } from '../../../__mocks__';

describe('VerifyEmailUseCase', () => {
  let verifyEmailUseCase: VerifyEmailUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    verifyEmailUseCase = new VerifyEmailUseCase(mockAuthRepository);
  });

  const validToken = {
    created_at: new Date(),
    expires_at: new Date(Date.now() + 60 * 60 * 1000),
    id: 'token-id',
    isExpired: () => false,
    isValid: () => true,
    token: 'valid-token',
    user_id: 'user-123',
    verified_at: null,
  };

  describe('execute', () => {
    it('should verify email successfully', async () => {
      mockAuthRepository.findEmailVerificationToken.mockResolvedValue([
        undefined,
        validToken,
      ]);
      mockAuthRepository.updateEmailVerified.mockResolvedValue([
        undefined,
        undefined,
      ] as any);
      mockAuthRepository.updateEmailVerificationTokenVerifiedDate.mockResolvedValue(
        [undefined, undefined] as any
      );

      const [error, result] = await verifyEmailUseCase.execute({
        token: 'valid-token',
      });

      expect(error).toBeUndefined();
      expect(result).toBe('Email verified');
      expect(mockAuthRepository.updateEmailVerified).toHaveBeenCalledWith(
        'user-123',
        true
      );
    });

    it('should return error if token not found', async () => {
      const mockErr = { message: 'Token not found', statusCode: 404 } as any;
      mockAuthRepository.findEmailVerificationToken.mockResolvedValue([
        mockErr,
        null,
      ]);

      const [error, result] = await verifyEmailUseCase.execute({
        token: 'invalid-token',
      });

      expect(error).toBeDefined();
      expect(result).toBeNull();
      expect(mockAuthRepository.updateEmailVerified).not.toHaveBeenCalled();
    });

    it('should return error if token is invalid', async () => {
      const invalidToken = { ...validToken, isValid: () => false };
      mockAuthRepository.findEmailVerificationToken.mockResolvedValue([
        undefined,
        invalidToken,
      ]);

      const [error, result] = await verifyEmailUseCase.execute({
        token: 'expired-token',
      });

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error?.message).toBe('Invalid token');
      expect(result).toBeNull();
    });
  });
});
