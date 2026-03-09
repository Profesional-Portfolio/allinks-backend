import { DeleteUserAvatarUseCase } from '@/domain/use-cases/users/delete-user-avatar.use-case';
import {
  mockUsersRepository,
  mockCacheService,
  mockUserWithoutPassword,
} from '../../../__mocks__';

describe('DeleteUserAvatarUseCase', () => {
  let deleteUserAvatarUseCase: DeleteUserAvatarUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    deleteUserAvatarUseCase = new DeleteUserAvatarUseCase(
      mockUsersRepository,
      mockCacheService as any
    );
  });

  describe('execute', () => {
    it('should delete avatar and invalidate cache successfully', async () => {
      mockUsersRepository.deleteAvatarUser.mockResolvedValue([undefined, mockUserWithoutPassword]);

      const [error, result] = await deleteUserAvatarUseCase.execute('user-123');

      expect(error).toBeNull();
      expect(result).toBe('Avatar deleted successfully');
      expect(mockCacheService.invalidateProfile).toHaveBeenCalledWith(
        mockUserWithoutPassword.id,
        mockUserWithoutPassword.username
      );
    });

    it('should return error if repository fails', async () => {
      const mockError = { message: 'Not found', statusCode: 404 };
      mockUsersRepository.deleteAvatarUser.mockResolvedValue([mockError as any, null]);

      const [error, result] = await deleteUserAvatarUseCase.execute('user-123');

      expect(error).toEqual(mockError);
      expect(result).toBeNull();
      expect(mockCacheService.invalidateProfile).not.toHaveBeenCalled();
    });
  });
});
