import { ResendVerificationEmailUseCase } from '@/domain/use-cases/auth/resend-verification-email.use-case';
import { SendWelcomeEmailUseCase } from '@/domain/use-cases/auth/send-welcome-email.use-case';

import {
  mockAuthRepository,
  mockEmailService,
  mockUserWithoutPassword,
} from '../../../__mocks__';

jest.mock('@/domain/use-cases/auth/send-welcome-email.use-case');

describe('ResendVerificationEmailUseCase', () => {
  let resendVerificationEmailUseCase: ResendVerificationEmailUseCase;
  let mockSendWelcomeEmailUseCase: jest.Mocked<SendWelcomeEmailUseCase>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendWelcomeEmailUseCase = {
      execute: jest.fn().mockResolvedValue(true),
    } as any;

    resendVerificationEmailUseCase = new ResendVerificationEmailUseCase(
      mockAuthRepository,
      mockSendWelcomeEmailUseCase
    );
  });

  const successMessage =
    'If the email exists, a verification email has been sent';

  describe('execute', () => {
    it('should resend verification email successfully', async () => {
      const unverifiedUser = {
        ...mockUserWithoutPassword,
        email_verified: false,
      };
      mockAuthRepository.findUserByEmail.mockResolvedValue([
        undefined,
        unverifiedUser,
      ]);

      const [error, result] = await resendVerificationEmailUseCase.execute({
        email: 'test@test.com',
      });

      expect(error).toBeUndefined();
      expect(result).toBe(successMessage);
      expect(mockSendWelcomeEmailUseCase.execute).toHaveBeenCalledWith(
        unverifiedUser.id,
        unverifiedUser.email,
        unverifiedUser.first_name
      );
    });

    it('should return success message even if user not found (security)', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue([undefined, null]);

      const [error, result] = await resendVerificationEmailUseCase.execute({
        email: 'nonexistent@test.com',
      });

      expect(error).toBeUndefined();
      expect(result).toBe(successMessage);
      expect(mockSendWelcomeEmailUseCase.execute).not.toHaveBeenCalled();
    });

    it('should not send email if user is already verified', async () => {
      const verifiedUser = { ...mockUserWithoutPassword, email_verified: true };
      mockAuthRepository.findUserByEmail.mockResolvedValue([
        undefined,
        verifiedUser,
      ]);

      const [error, result] = await resendVerificationEmailUseCase.execute({
        email: 'test@test.com',
      });

      expect(error).toBeUndefined();
      expect(result).toBe(successMessage);
      expect(mockSendWelcomeEmailUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
