import { BcryptPasswordHasherAdapter } from '../../../src/infraestructure/adapters/bcrypt-password-hasher.adapter';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('BcryptPasswordHasher', () => {
  let passwordHasher: BcryptPasswordHasherAdapter;
  const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(() => {
    passwordHasher = new BcryptPasswordHasherAdapter();
    jest.clearAllMocks();
  });

  describe('hash', () => {
    it('should hash password correctly', async () => {
      const password = 'myPassword123';
      const hashedPassword = 'hashedPassword123';

      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await passwordHasher.hash(password);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });

    it('should throw error if hashing fails', async () => {
      const password = 'myPassword123';

      mockBcrypt.hash.mockRejectedValue(new Error('Hashing failed') as never);

      await expect(passwordHasher.hash(password)).rejects.toThrow(
        'Hashing failed'
      );
    });
  });

  describe('compare', () => {
    it('should return true when passwords match', async () => {
      const password = 'myPassword123';
      const hashedPassword = 'hashedPassword123';

      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await passwordHasher.compare(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false when passwords do not match', async () => {
      const password = 'myPassword123';
      const hashedPassword = 'hashedPassword123';

      mockBcrypt.compare.mockResolvedValue(false as never);

      const result = await passwordHasher.compare(password, hashedPassword);

      expect(result).toBe(false);
    });

    it('should throw error if comparison fails', async () => {
      const password = 'myPassword123';
      const hashedPassword = 'hashedPassword123';

      mockBcrypt.compare.mockRejectedValue(
        new Error('Comparison failed') as never
      );

      await expect(
        passwordHasher.compare(password, hashedPassword)
      ).rejects.toThrow('Comparison failed');
    });
  });
});
