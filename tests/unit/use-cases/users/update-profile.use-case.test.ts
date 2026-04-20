/* eslint-disable @typescript-eslint/unbound-method */
import { UpdateProfileUseCase } from '@/domain/use-cases/users/update-profile.use-case';

import {
  mockCacheService,
  mockUsersRepository,
  mockUserWithoutPassword,
} from '../../../__mocks__';

describe('UpdateProfileUseCase', () => {
  let updateProfileUseCase: UpdateProfileUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    updateProfileUseCase = new UpdateProfileUseCase(
      mockUsersRepository,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCacheService as any
    );
  });

  const updateData = {
    bio: 'New bio',
    first_name: 'Updated',
    last_name: 'Name',
    username: 'updatedusername',
  };

  describe('execute', () => {
    it('should update profile and invalidate cache successfully', async () => {
      const updatedUser = { ...mockUserWithoutPassword, ...updateData };
      mockUsersRepository.updateProfileUser.mockResolvedValue([
        undefined,
        updatedUser,
      ]);

      const [error, user] = await updateProfileUseCase.execute(
        'user-123',
        updateData
      );

      expect(error).toBeUndefined();
      expect(user).toEqual(updatedUser);
      expect(mockUsersRepository.updateProfileUser).toHaveBeenCalledWith(
        'user-123',
        updateData
      );
      expect(mockCacheService.invalidateProfile).toHaveBeenCalledWith(
        updatedUser.id,
        updatedUser.username
      );
    });

    it('should return error if update fails', async () => {
      const mockError = { message: 'Update failed', statusCode: 400 };
      mockUsersRepository.updateProfileUser.mockResolvedValue([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockError as any,
        null,
      ]);

      const [error, user] = await updateProfileUseCase.execute(
        'user-123',
        updateData
      );

      expect(error).toEqual(mockError);
      expect(user).toBeNull();
      expect(mockCacheService.invalidateProfile).not.toHaveBeenCalled();
    });
  });
});
