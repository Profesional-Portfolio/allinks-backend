import { SendWelcomeEmailUseCase } from '@/domain/use-cases/auth/send-welcome-email.use-case';
import { mockAuthRepository, mockEmailService } from '../../../__mocks__';

jest.mock('@/infraestructure/utils', () => ({
  generateToken: () => ({
    token: 'mock-token-123',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
  }),
  formatValidationError: jest.fn(),
  COOKIE_NAMES: { ACCESS_TOKEN: 'access_token', REFRESH_TOKEN: 'refresh_token' },
}));

jest.mock('@/config/env', () => ({
  ENV: {
    MAIN_FRONTEND_HOST: 'http://localhost:3000',
    SMTP_HOST: 'smtp.test.com',
    SMTP_PORT: '587',
    SMTP_SECURE: 'false',
    SMTP_USER: 'test@example.com',
    SMTP_PASSWORD: 'testpassword',
    SMTP_FROM_EMAIL: 'noreply@allinks.com',
    SMTP_FROM_NAME: 'Allinks',
  },
}));

describe('SendWelcomeEmailUseCase', () => {
  let sendWelcomeEmailUseCase: SendWelcomeEmailUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    sendWelcomeEmailUseCase = new SendWelcomeEmailUseCase(
      mockAuthRepository,
      mockEmailService
    );
  });

  describe('execute', () => {
    it('should send welcome email and return true', async () => {
      mockAuthRepository.deleteUserEmailVerificationTokens.mockResolvedValue([undefined, undefined] as any);
      mockAuthRepository.createEmailVerificationToken.mockResolvedValue([undefined, undefined] as any);
      mockEmailService.sendEmail.mockResolvedValue(true);

      const result = await sendWelcomeEmailUseCase.execute('user-123', 'test@test.com', 'Test');

      expect(result).toBe(true);
      expect(mockAuthRepository.deleteUserEmailVerificationTokens).toHaveBeenCalledWith('user-123');
      expect(mockAuthRepository.createEmailVerificationToken).toHaveBeenCalledWith(
        'user-123',
        'mock-token-123',
        expect.any(Date)
      );
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@test.com',
          subject: '¡Bienvenido! Verifica tu cuenta',
        })
      );
    });

    it('should return false if email sending fails', async () => {
      mockAuthRepository.deleteUserEmailVerificationTokens.mockResolvedValue([undefined, undefined] as any);
      mockAuthRepository.createEmailVerificationToken.mockResolvedValue([undefined, undefined] as any);
      mockEmailService.sendEmail.mockResolvedValue(false);

      const result = await sendWelcomeEmailUseCase.execute('user-123', 'test@test.com', 'Test');

      expect(result).toBe(false);
    });
  });
});
