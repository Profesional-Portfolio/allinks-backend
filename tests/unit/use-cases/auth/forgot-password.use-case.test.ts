import { ForgotPasswordDto } from '@/domain/dtos';
import { Context, MockContext, createMockContext } from '../../../context';
import {
  ForgotPasswordUseCase,
  PasswordResetTokenEntity,
} from '@/domain/index';
import {
  mockAuthRepository,
  mockEmailService,
  mockUserWithoutPassword,
} from '../../../__mocks__';
import { NotFoundException } from '@/domain/exceptions';
import { generateToken } from '@/infraestructure/utils';

let mockCtx: MockContext;
let ctx: Context;

const forgotPasswordDto: ForgotPasswordDto = {
  email: 'test@test.com',
};

const passwordResetToken: PasswordResetTokenEntity = {
  user_id: mockUserWithoutPassword.id,
  token: generateToken().token,
  expires_at: generateToken().expires_at,
  used_at: null,
  created_at: new Date(),
  id: '1',
  isExpired: () => false,
  isValid: () => true,
};

describe('ForgotPasswordUseCase', () => {
  let forgotPasswordUseCase: ForgotPasswordUseCase;

  beforeEach(() => {
    forgotPasswordUseCase = new ForgotPasswordUseCase(
      mockAuthRepository,
      mockEmailService
    );
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
  });

  describe('execute', () => {
    it('should execute successfully the forgot password use case', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue([
        undefined,
        mockUserWithoutPassword,
      ]);
      mockAuthRepository.deleteUserEmailVerificationTokens.mockResolvedValue([
        undefined,
        'Email verification tokens deleted',
      ]);
      mockAuthRepository.createPasswordResetToken.mockResolvedValue([
        undefined,
        passwordResetToken,
      ]);
      mockEmailService.sendEmail.mockResolvedValue(true);

      const [error, response] =
        await forgotPasswordUseCase.execute(forgotPasswordDto);

      expect(error).toBeUndefined();
      expect(response).toBeTruthy();
    });
    it('should return error if user is not found', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue([
        new NotFoundException('User not found'),
        null,
      ]);
      const [error, response] =
        await forgotPasswordUseCase.execute(forgotPasswordDto);
      expect(error).toBeDefined();
      expect(response).toBeTruthy();
    });
  });
});
