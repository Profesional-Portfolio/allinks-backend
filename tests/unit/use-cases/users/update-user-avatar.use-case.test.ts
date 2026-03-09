import { UpdateUserAvatarUseCase } from '@/domain/use-cases/users/update-user-avatar.use-case';
import {
  mockUsersRepository,
  mockCacheService,
  mockUserWithoutPassword,
} from '../../../__mocks__';

describe('UpdateUserAvatarUseCase', () => {
  let updateUserAvatarUseCase: UpdateUserAvatarUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    updateUserAvatarUseCase = new UpdateUserAvatarUseCase(
      mockUsersRepository,
      mockCacheService as any
    );
  });

  const avatarUrl = 'https://example.com/avatar.jpg';

  describe('execute', () => {
    it('should update avatar and invalidate cache successfully', async () => {
      const updatedUser = { ...mockUserWithoutPassword, avatar_url: avatarUrl };
      mockUsersRepository.updateAvatarUser.mockResolvedValue([undefined, updatedUser]);

      const [error, result] = await updateUserAvatarUseCase.execute('user-123', avatarUrl);

      expect(error).toBeNull();
      expect(result).toBe(avatarUrl);
      expect(mockUsersRepository.updateAvatarUser).toHaveBeenCalledWith('user-123', avatarUrl);
      expect(mockCacheService.invalidateProfile).toHaveBeenCalledWith(
        updatedUser.id,
        updatedUser.username
      );
    });

    it('should return error if update fails', async () => {
      const mockError = { message: 'Upload failed', statusCode: 400 };
      mockUsersRepository.updateAvatarUser.mockResolvedValue([mockError as any, null]);

      const [error, result] = await updateUserAvatarUseCase.execute('user-123', avatarUrl);

      expect(error).toEqual(mockError);
      expect(result).toBeNull();
      expect(mockCacheService.invalidateProfile).not.toHaveBeenCalled();
    });
  });
});
