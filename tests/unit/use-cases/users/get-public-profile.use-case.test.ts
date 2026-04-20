import { GetPublicProfileUseCase } from '@/domain/use-cases/users/get-public-profile.use-case';

import {
  mockCacheService,
  mockLinksArrays,
  mockUsersRepository,
  mockUserWithoutPassword,
} from '../../../__mocks__';

describe('GetPublicProfileUseCase', () => {
  let getPublicProfileUseCase: GetPublicProfileUseCase;

  const mockPublicProfile = {
    ...mockUserWithoutPassword,
    links: mockLinksArrays[0],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getPublicProfileUseCase = new GetPublicProfileUseCase(
      mockUsersRepository,
      mockCacheService as any
    );
  });

  describe('execute', () => {
    it('should return cached public profile if it exists', async () => {
      mockCacheService.getPublicProfile.mockResolvedValue(mockPublicProfile);

      const [error, profile] =
        await getPublicProfileUseCase.execute('testuser');

      expect(error).toBeUndefined();
      expect(profile).toEqual(mockPublicProfile);
      expect(
        mockUsersRepository.findUserWithLinksByUsername
      ).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache if cache is empty', async () => {
      mockCacheService.getPublicProfile.mockResolvedValue(null);
      mockUsersRepository.findUserWithLinksByUsername.mockResolvedValue([
        undefined,
        mockPublicProfile,
      ]);
      mockCacheService.setPublicProfile.mockResolvedValue(undefined);

      const [error, profile] =
        await getPublicProfileUseCase.execute('testuser');

      expect(error).toBeUndefined();
      expect(profile).toEqual(mockPublicProfile);
      expect(
        mockUsersRepository.findUserWithLinksByUsername
      ).toHaveBeenCalledWith('testuser');
      expect(mockCacheService.setPublicProfile).toHaveBeenCalledWith(
        'testuser',
        mockPublicProfile
      );
    });

    it('should return error if repository fails', async () => {
      mockCacheService.getPublicProfile.mockResolvedValue(null);
      const mockError = { message: 'User not found', statusCode: 404 };
      mockUsersRepository.findUserWithLinksByUsername.mockResolvedValue([
        mockError as any,
        null,
      ]);

      const [error, profile] =
        await getPublicProfileUseCase.execute('unknownuser');

      expect(error).toEqual(mockError);
      expect(profile).toBeNull();
      expect(mockCacheService.setPublicProfile).not.toHaveBeenCalled();
    });
  });
});
