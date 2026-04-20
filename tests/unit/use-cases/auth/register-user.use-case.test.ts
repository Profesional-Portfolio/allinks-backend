/* eslint-disable @typescript-eslint/unbound-method */
import { RegisterUserDto } from '@/domain/dtos/auth/register-user.dto';
import { RegisterUserUseCase } from '@/domain/use-cases/auth/register-user.use-case';

import {
  mockAuthRepository,
  mockCacheService,
  mockPasswordHasher,
  mockTokenProvider,
  mockUser,
  mockUserWithoutPassword,
} from '../../../__mocks__';
import { Context, createMockContext, MockContext } from '../../../context';

const registerDto: RegisterUserDto = {
  avatar_url: '',
  bio: '',
  email: 'test@test.com',
  email_verified: false,
  first_name: 'Test User',
  is_active: true,
  last_name: 'Test',
  password: 'Password123!',
  username: 'testuser',
};

const hashedPassword = 'hashed-password';
const accessToken = 'access-token';
const refreshToken = 'refresh-token';

describe('RegisterUserUseCase', () => {
  let registerUserUseCase: RegisterUserUseCase;
   
  let mockCtx: MockContext;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let ctx: Context;

  beforeEach(() => {
    registerUserUseCase = new RegisterUserUseCase(
      mockAuthRepository,
      mockTokenProvider,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCacheService as any
    );
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
  });

  describe('execute', () => {
    it('should register user successfully', async () => {
      mockAuthRepository.register.mockResolvedValue([
        undefined,
        mockUserWithoutPassword,
      ]);
      mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockTokenProvider.generateTokenPair.mockResolvedValue([
        undefined,
        { accessToken, refreshToken },
      ]);

      const [error, response] = await registerUserUseCase.execute(registerDto);

      expect(mockAuthRepository.register).toHaveBeenCalledWith(registerDto);
      expect(mockTokenProvider.generateTokenPair).toHaveBeenCalledWith({
        email: registerDto.email,
        id: mockUser.id,
      });
      expect(error).toBeUndefined();
      if (response) {
        expect(response.user).toEqual(mockUserWithoutPassword);
        expect(response.tokens).toEqual({ accessToken, refreshToken });
      }
    });
  });
});
