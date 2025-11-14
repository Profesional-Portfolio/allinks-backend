import { AuthRepositoryImpl } from '../../../src/infraestructure/repositories/auth.repository.impl';
import { AuthDatasourceImpl } from '../../../src/infraestructure/datasources/auth.datasource.impl';
import { MockContext, Context, createMockContext } from '../../context';
import { BcryptPasswordHasherAdapter } from '@/infraestructure/adapters';
import { PasswordHasher } from '@/domain/interfaces';
import { validRegisterPayload } from '../../payloads';
import { mockUser } from '../../__mocks__';
import { UserEntity } from '@/domain/entities';

let mockCtx: MockContext;
let ctx: Context;

describe('AuthRepository Integration Tests', () => {
  let authRepository: AuthRepositoryImpl;
  let authDatasource: AuthDatasourceImpl;
  let passwordHasher: PasswordHasher;

  beforeEach(() => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;

    passwordHasher = new BcryptPasswordHasherAdapter();
    authDatasource = new AuthDatasourceImpl(passwordHasher);
    authRepository = new AuthRepositoryImpl(authDatasource);
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      // (mockCtx.prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockCtx.prisma.user.create.mockResolvedValue(mockUser);

      const result = await authRepository.findUserByEmail('test@test.com');

      expect(mockCtx.prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      (mockCtx.prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await authRepository.findUserByEmail(
        'nonexistent@test.com'
      );

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      (mockCtx.prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        authRepository.findUserByEmail('test@test.com')
      ).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const mockUser = {
        id: '123',
        email: 'test@test.com',
        name: 'Test User',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      };

      (mockCtx.prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await authRepository.findUserById('123');

      expect(mockCtx.prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      (mockCtx.prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await authRepository.findUserById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new user', async () => {
      const userData = {
        email: 'newuser@test.com',
        name: 'New User',
        password: 'hashed-password',
      };

      const mockCreatedUser = {
        id: '123',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      };

      (mockCtx.prisma.user.create as jest.Mock).mockResolvedValue(
        mockCreatedUser
      );

      const result = await authRepository.register(validRegisterPayload);

      expect(mockCtx.prisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });
      expect(result).toEqual(mockCreatedUser);
      expect(result.id).toBeDefined();
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@test.com',
        name: 'User',
        password: 'hashed-password',
      };

      (mockCtx.prisma.user.create as jest.Mock).mockRejectedValue(
        new Error('Unique constraint failed')
      );

      await expect(
        authRepository.register(validRegisterPayload)
      ).rejects.toThrow('Unique constraint failed');
    });
  });

  describe('updateLastLogin', () => {
    it('should update user last login timestamp', async () => {
      const userId = '123';
      const updatedUser = {
        id: userId,
        email: 'test@test.com',
        name: 'Test User',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      };

      (mockCtx.prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      await authRepository.updateLastLogin(userId);

      expect(mockCtx.prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it('should throw error if user not found', async () => {
      (mockCtx.prisma.user.update as jest.Mock).mockRejectedValue(
        new Error('User not found')
      );

      await expect(
        authRepository.updateLastLogin('nonexistent-id')
      ).rejects.toThrow('User not found');
    });
  });
});
