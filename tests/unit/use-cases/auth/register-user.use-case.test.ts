// tests/unit/use-cases/register-user.use-case.test.ts
import { RegisterUserUseCase } from '@/domain/use-cases/auth/register-user.use-case';
import { AuthRepository } from '@/domain/repositories/auth.repository';
import { PasswordHasher } from '@/domain/interfaces/auth/password-hasher.interface';
import { TokenProvider } from '@/domain/interfaces/auth/token-provider.interface';
import { RegisterUserDto } from '@/domain/dtos/auth/register-user.dto';
import { UserEntity } from '@/domain/entities/user.entity';
import { Context, createMockContext, MockContext } from '../../../context';

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

describe.skip('RegisterUserUseCase', () => {
  let registerUserUseCase: RegisterUserUseCase;
  let mockAuthRepository: jest.Mocked<AuthRepository>;
  let mockPasswordHasher: jest.Mocked<PasswordHasher>;
  let mockTokenProvider: jest.Mocked<TokenProvider>;

  beforeEach(() => {
    mockAuthRepository = {
      login: jest.fn(),
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
      register: jest.fn(),
      updateLastLogin: jest.fn(),
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
      const mockUser: UserEntity = {
        id: '123',
        email: validDto.email,
        first_name: validDto.first_name,
        last_name: validDto.last_name,
        username: validDto.username,
        bio: validDto.bio!,
        avatar_url: validDto.avatar_url!,
        is_active: validDto.is_active,
        email_verified: validDto.email_verified,
        password_hash: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
        last_login_at: null,
      };

      mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockTokenProvider.generateRefreshToken.mockResolvedValue(refreshToken);

      const result = await registerUserUseCase.execute(validDto);

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(validDto.password);
      expect(mockTokenProvider.generateRefreshToken).toHaveBeenCalled();

      expect(result).toEqual({
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.first_name,
        }),
        accessToken,
        refreshToken,
      });
    });

    it('should throw error if email already exists', async () => {
      const existingUser: UserEntity = {
        id: '123',
        email: validDto.email,
        first_name: validDto.first_name,
        last_name: validDto.last_name,
        username: validDto.username,
        bio: validDto.bio!,
        avatar_url: validDto.avatar_url!,
        is_active: validDto.is_active,
        email_verified: validDto.email_verified,
        password_hash: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
        last_login_at: null,
      };

      // mockAuthRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(registerUserUseCase.execute(validDto)).rejects.toThrow(
        'Email already exists'
      );
      expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
      // expect(mockAuthRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error if password hashing fails', async () => {
      // mockAuthRepository.findByEmail.mockResolvedValue(null);
      mockPasswordHasher.hash.mockRejectedValue(new Error('Hashing failed'));

      await expect(registerUserUseCase.execute(validDto)).rejects.toThrow(
        'Hashing failed'
      );
      // expect(mockAuthRepository.create).not.toHaveBeenCalled();
    });
  });
});
