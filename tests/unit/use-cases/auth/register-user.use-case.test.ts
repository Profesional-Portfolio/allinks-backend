// tests/unit/use-cases/register-user.use-case.test.ts
import { RegisterUserUseCase } from '@/domain/use-cases/auth/register-user.use-case';
import { AuthRepository } from '@/domain/repositories/auth.repository';
import { PasswordHasher } from '@/domain/interfaces/auth/password-hasher.interface';
import { TokenProvider } from '@/domain/interfaces/auth/token-provider.interface';
import { RegisterUserDto } from '@/domain/dtos/auth/register-user.dto';
import { UserEntity } from '@/domain/entities/user.entity';
import { Context, createMockContext, MockContext } from '../../../context';
import { Exception } from '@/domain/exceptions';
import { mockUser, mockUserWithoutPassword } from '../../../__mocks__';

let mockCtx: MockContext;
let ctx: Context;

const validDto: RegisterUserDto = {
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
  let mockAuthRepository: jest.Mocked<AuthRepository>;
  let mockPasswordHasher: jest.Mocked<PasswordHasher>;
  let mockTokenProvider: jest.Mocked<TokenProvider>;

  beforeEach(() => {
    mockAuthRepository = {
      login: jest.fn(),
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
      updateLastLogin: jest.fn(),
      register: jest.fn(),
    } as jest.Mocked<AuthRepository>;

    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as jest.Mocked<PasswordHasher>;

    mockTokenProvider = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      generateTokenPair: jest.fn(),
    } as jest.Mocked<TokenProvider>;

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

      const [error, response] = await registerUserUseCase.execute(validDto);

      expect(mockAuthRepository.register).toHaveBeenCalledWith(validDto);
      expect(mockTokenProvider.generateTokenPair).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: validDto.email,
      });
      expect(error).toBeUndefined();
      expect(response.user).toEqual(mockUserWithoutPassword);
      expect(response.tokens).toEqual({ accessToken, refreshToken });
    });
  });
});
