import { ForgotPasswordDto } from '@/domain/dtos';
import { NotFoundException } from '@/domain/exceptions';
import {
  ForgotPasswordUseCase,
  PasswordResetTokenEntity,
} from '@/domain/index';
import { generateToken } from '@/infraestructure/utils';

import {
  mockAuthRepository,
  mockEmailService,
  mockUserWithoutPassword,
} from '../../../__mocks__';
import { Context, createMockContext, MockContext } from '../../../context';

let mockCtx: MockContext;
let ctx: Context;

const forgotPasswordDto: ForgotPasswordDto = {
  email: 'test@test.com',
};

const passwordResetToken: PasswordResetTokenEntity = {
  created_at: new Date(),
  expires_at: generateToken().expires_at,
  id: '1',
  isExpired: () => false,
  isValid: () => true,
  token: generateToken().token,
  used_at: null,
  user_id: mockUserWithoutPassword.id,
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
