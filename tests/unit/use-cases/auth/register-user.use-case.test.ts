import { RegisterUserUseCase } from '@/domain/use-cases/auth/register-user.use-case';
import { RegisterUserDto } from '@/domain/dtos/auth/register-user.dto';
import { Context, createMockContext, MockContext } from '../../../context';
import {
  mockAuthRepository,
  mockPasswordHasher,
  mockTokenProvider,
  mockUser,
  mockUserWithoutPassword,
} from '../../../__mocks__';

let mockCtx: MockContext;
let ctx: Context;

const registerDto: RegisterUserDto = {
  email: 'test@test.com',
  password: 'Password123!',
  first_name: 'Test User',
  last_name: 'Test',
  username: 'testuser',
  is_active: true,
  email_verified: false,
  avatar_url: '',
  bio: '',
};

const hashedPassword = 'hashed-password';
const accessToken = 'access-token';
const refreshToken = 'refresh-token';

describe('RegisterUserUseCase', () => {
  let registerUserUseCase: RegisterUserUseCase;

  beforeEach(() => {
    registerUserUseCase = new RegisterUserUseCase(
      mockAuthRepository,
      mockTokenProvider
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
        id: mockUser.id,
        email: registerDto.email,
      });
      expect(error).toBeUndefined();
      expect(response.user).toEqual(mockUserWithoutPassword);
      expect(response.tokens).toEqual({ accessToken, refreshToken });
    });
  });
});
