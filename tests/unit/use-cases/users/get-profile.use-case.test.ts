import { GetProfileUseCase } from '@/domain/use-cases/users/get-profile.use-case';
import {
  mockUsersRepository,
  mockCacheService,
  mockUserWithoutPassword,
} from '../../../__mocks__';

describe('GetProfileUseCase', () => {
  let getProfileUseCase: GetProfileUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    getProfileUseCase = new GetProfileUseCase(mockUsersRepository, mockCacheService as any);
  });

  describe('execute', () => {
    it('should return cached profile if it exists', async () => {
      mockCacheService.getUserProfile.mockResolvedValue(mockUserWithoutPassword);

      const [error, user] = await getProfileUseCase.execute('user-123');

      expect(error).toBeUndefined();
      expect(user).toEqual(mockUserWithoutPassword);
      expect(mockUsersRepository.findUserById).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache if cache is empty', async () => {
      mockCacheService.getUserProfile.mockResolvedValue(null);
      mockUsersRepository.findUserById.mockResolvedValue([undefined, mockUserWithoutPassword]);
      mockCacheService.setUserProfile.mockResolvedValue(undefined);

      const [error, user] = await getProfileUseCase.execute('user-123');

      expect(error).toBeUndefined();
      expect(user).toEqual(mockUserWithoutPassword);
      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith('user-123');
      expect(mockCacheService.setUserProfile).toHaveBeenCalledWith('user-123', mockUserWithoutPassword);
    });

    it('should return error if repository fails', async () => {
      mockCacheService.getUserProfile.mockResolvedValue(null);
      const mockError = { message: 'Not found', statusCode: 404 };
      mockUsersRepository.findUserById.mockResolvedValue([mockError as any, null]);

      const [error, user] = await getProfileUseCase.execute('user-123');

      expect(error).toEqual(mockError);
      expect(user).toBeNull();
      expect(mockCacheService.setUserProfile).not.toHaveBeenCalled();
    });
  });
});
