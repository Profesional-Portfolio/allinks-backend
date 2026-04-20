import { CheckAvailabilityUsernameUseCase } from '@/domain/use-cases/users/check-availability-username.use-case';

import { mockUsersRepository } from '../../../__mocks__';

describe('CheckAvailabilityUsernameUseCase', () => {
  let checkAvailabilityUseCase: CheckAvailabilityUsernameUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    checkAvailabilityUseCase = new CheckAvailabilityUsernameUseCase(
      mockUsersRepository
    );
  });

  describe('execute', () => {
    it('should return true if username is available', async () => {
      mockUsersRepository.checkUsernameAvailability.mockResolvedValue([
        undefined,
        true,
      ]);

      const [error, isAvailable] =
        await checkAvailabilityUseCase.execute('newuser');

      expect(error).toBeUndefined();
      expect(isAvailable).toBe(true);
      expect(
        mockUsersRepository.checkUsernameAvailability
      ).toHaveBeenCalledWith('newuser');
    });

    it('should return false if username is taken', async () => {
      mockUsersRepository.checkUsernameAvailability.mockResolvedValue([
        undefined,
        false,
      ]);

      const [error, isAvailable] =
        await checkAvailabilityUseCase.execute('existinguser');

      expect(error).toBeUndefined();
      expect(isAvailable).toBe(false);
    });

    it('should return error if repository fails', async () => {
      const mockError = { message: 'DB error', statusCode: 500 };
      mockUsersRepository.checkUsernameAvailability.mockResolvedValue([
        mockError as any,
        false,
      ]);

      const [error] = await checkAvailabilityUseCase.execute('username');

      expect(error).toEqual(mockError);
    });
  });
});
