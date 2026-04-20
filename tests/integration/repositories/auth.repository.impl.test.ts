/* eslint-disable @typescript-eslint/unbound-method */
import { PasswordHasher } from '@/domain/interfaces';
import { BcryptPasswordHasherAdapter } from '@/infraestructure/adapters';

import { AuthDatasourceImpl } from '../../../src/infraestructure/datasources/auth.datasource.impl';
import { AuthRepositoryImpl } from '../../../src/infraestructure/repositories/auth.repository.impl';
import { mockUser } from '../../__mocks__';
import { validRegisterPayload } from '../../payloads';
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      const [error, result] =
        await authRepository.findUserByEmail('test@test.com');

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(error).toBeUndefined();
      expect(result).toHaveProperty('id');
    });

    it('should return null if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const [error, result] = await authRepository.findUserByEmail(
        'nonexistent@test.com'
      );

      expect(error).toBeInstanceOf(Error);
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      prismaMock.user.findUnique.mockRejectedValue(
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      const [err, result] = await authRepository.findUserById('123');

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(err).toBeUndefined();
      expect(result).not.toBeNull();
    });

    it('should return null if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const [error, result] =
        await authRepository.findUserById('nonexistent-id');

      expect(error).toBeInstanceOf(Error);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new user', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.user.create.mockResolvedValue(mockUser as any);

      const [err, result] = await authRepository.register(validRegisterPayload);

      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
      expect(err).toBeUndefined();
      expect(result).not.toBeNull();
    });

    it('should throw error if email already exists', async () => {
      prismaMock.user.create.mockRejectedValue(
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
        created_at: new Date(),
        email: 'test@test.com',
        id: userId,
        lastLoginAt: new Date(),
        name: 'Test User',
        password: 'hashed-password',
        updatedAt: new Date(),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaMock.user.update.mockResolvedValue(updatedUser as any);

      await authRepository.updateLastLogin(userId);

      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
    });

    it('should throw error if user not found', async () => {
      prismaMock.user.update.mockRejectedValue(
        new Error('User not found')
      );

      const [err, result] = await authRepository.updateLastLogin('nonexistent');

      expect(err).toBeInstanceOf(Error);
      expect(result).toBeUndefined();
    });
  });
});
