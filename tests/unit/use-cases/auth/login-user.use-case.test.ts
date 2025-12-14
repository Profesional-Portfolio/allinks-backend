import { LoginUserDto } from '@/domain/dtos';
import { Context, MockContext, createMockContext } from '../../../context';
import { LoginUserUseCase } from '@/domain/index';
import {
  mockAuthRepository,
  mockTokenProvider,
  mockUserWithoutPassword,
} from '../../../__mocks__';
import { BadRequestException, NotFoundException } from '@/domain/exceptions';

let mockCtx: MockContext;
let ctx: Context;

const loginDto: LoginUserDto = {
  email: 'test@test.com',
  password: 'Password123!',
};

const accessToken = 'access-token';
const refreshToken = 'refresh-token';

describe('LoginUserUseCase', () => {
  let loginUserUseCase: LoginUserUseCase;

  beforeEach(() => {
    loginUserUseCase = new LoginUserUseCase(
      mockAuthRepository,
      mockTokenProvider
    );
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
  });

  describe('execute', () => {
    it('should login a user', async () => {
      mockAuthRepository.login.mockResolvedValue([
        undefined,
        mockUserWithoutPassword,
      ]);
      mockTokenProvider.generateTokenPair.mockResolvedValue([
        undefined,
        { accessToken, refreshToken },
      ]);
      const [error, result] = await loginUserUseCase.execute(loginDto);
      expect(error).toBeUndefined();
      expect(mockAuthRepository.login).toHaveBeenCalledWith(loginDto);
      expect(mockTokenProvider.generateTokenPair).toHaveBeenCalledWith({
        id: mockUserWithoutPassword.id,
        email: mockUserWithoutPassword.email,
      });
      expect(result).toBeDefined();
      expect(result?.user).toBeDefined();
      expect(result?.tokens).toBeDefined();
      expect(result?.tokens.accessToken).toBe(accessToken);
      expect(result?.tokens.refreshToken).toBe(refreshToken);
    });
    it('should return error if user is not found', async () => {
      mockAuthRepository.login.mockResolvedValue([
        new NotFoundException('User not found'),
        null,
      ]);
      const [error, result] = await loginUserUseCase.execute(loginDto);
      expect(error).toBeDefined();
      expect(result).toBeNull();
    });
    it('should return error if password is incorrect', async () => {
      mockAuthRepository.login.mockResolvedValue([
        new BadRequestException('Invalid credentials'),
        null,
      ]);
      const [error, result] = await loginUserUseCase.execute(loginDto);
      expect(error).toBeDefined();
      expect(result).toBeNull();
    });
  });
});
