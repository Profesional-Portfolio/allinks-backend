import { AuthRepositoryImpl } from '../../../src/infraestructure/repositories/auth.repository.impl';
import { AuthDatasourceImpl } from '../../../src/infraestructure/datasources/auth.datasource.impl';
import { BcryptPasswordHasherAdapter } from '@/infraestructure/adapters';
import { PasswordHasher } from '@/domain/interfaces';
import { validRegisterPayload } from '../../payloads';
import { mockUser } from '../../__mocks__';
import { prismaMock } from '../../setup-unit';

describe('AuthRepository Integration Tests', () => {
  let authRepository: AuthRepositoryImpl;
  let authDatasource: AuthDatasourceImpl;
  let passwordHasher: PasswordHasher;

  beforeEach(() => {
    passwordHasher = new BcryptPasswordHasherAdapter();
    authDatasource = new AuthDatasourceImpl(passwordHasher, prismaMock);
    authRepository = new AuthRepositoryImpl(authDatasource);
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const [error, result] =
        await authRepository.findUserByEmail('test@test.com');

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(error).toBeUndefined();
      expect(result).toHaveProperty('id');
    });

    it('should return null if user not found', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

      const [error, result] = await authRepository.findUserByEmail(
        'nonexistent@test.com'
      );

      expect(error).toBeInstanceOf(Error);
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const [error, result] =
        await authRepository.findUserByEmail('test@test.com');

      expect(error).toBeInstanceOf(Error);
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const [err, result] = await authRepository.findUserById('123');

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(err).toBeUndefined();
      expect(result).not.toBeNull();
    });

    it('should return null if user not found', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

      const [error, result] =
        await authRepository.findUserById('nonexistent-id');

      expect(error).toBeInstanceOf(Error);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new user', async () => {
      (prismaMock.user.create as jest.Mock).mockResolvedValue(mockUser);

      const [err, result] = await authRepository.register(validRegisterPayload);

      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
      expect(err).toBeUndefined();
      expect(result).not.toBeNull();
    });

    it('should throw error if email already exists', async () => {
      (prismaMock.user.create as jest.Mock).mockRejectedValue(
        new Error('Unique constraint failed')
      );

      const [err, result] = await authRepository.register(validRegisterPayload);

      expect(err).toBeInstanceOf(Error);
      expect(result).toBeNull();
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
        created_at: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      };

      (prismaMock.user.update as jest.Mock).mockResolvedValue(updatedUser);

      await authRepository.updateLastLogin(userId);

      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
    });

    it('should throw error if user not found', async () => {
      (prismaMock.user.update as jest.Mock).mockRejectedValue(
        new Error('User not found')
      );

      const [err, result] = await authRepository.updateLastLogin('nonexistent');

      expect(err).toBeInstanceOf(Error);
      expect(result).toBeUndefined();
    });
  });
});
