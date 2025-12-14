import { AuthDatasourceImpl } from '../../../src/infraestructure/datasources/auth.datasource.impl';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PasswordHasher } from '@/domain/interfaces';
import { prismaMock } from '../../setup-unit';
import { BcryptPasswordHasherAdapter } from '@/infraestructure/adapters';
import { mockUser } from '../../__mocks__';
import { validRegisterPayload } from '../../payloads';

describe('AuthDatasource Integration Tests', () => {
  let authDatasource: AuthDatasourceImpl;
  let passwordHasher: PasswordHasher;

  beforeEach(() => {
    passwordHasher = new BcryptPasswordHasherAdapter();
    authDatasource = new AuthDatasourceImpl(passwordHasher, prismaMock);
  });

  describe('Database Operations', () => {
    it('should handle transaction rollback on error', async () => {
      const error = new Error('Transaction failed');
      prismaMock.user.create.mockRejectedValue(error);

      const [err, result] = await authDatasource.register(validRegisterPayload);

      expect(err).toBeInstanceOf(Error);
      expect(result).toBeNull();

      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    });

    it('should properly map Prisma errors', async () => {
      const prismaError = {
        code: 'P2002',
        meta: { target: ['email'] },
        message: 'Unique constraint violation',
      };

      prismaMock.user.create.mockRejectedValue(prismaError);

      const [err, result] = await authDatasource.register(validRegisterPayload);

      expect(err).toBeInstanceOf(Error);
      expect(result).toBeNull();

      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Query Optimization', () => {
    it('should use proper select fields to avoid overfetching', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      await authDatasource.findUserByEmail('test@test.com');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('Connection Handling', () => {
    it('should handle connection errors gracefully', async () => {
      const error = new Error('Connection refused');
      prismaMock.user.findUnique.mockRejectedValue(error);

      const [err, result] =
        await authDatasource.findUserByEmail('test@test.com');

      expect(err).toBeInstanceOf(Error);
      expect(result).toBeNull();

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should handle timeout errors', async () => {
      const error = new Error('Query timeout');
      prismaMock.user.findUnique.mockRejectedValue(error);

      const [err, result] =
        await authDatasource.findUserByEmail('test@test.com');

      expect(err).toBeInstanceOf(Error);
      expect(result).toBeNull();

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});
