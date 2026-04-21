import { ChangeVisibilityUseCase } from '@/domain/use-cases/links/change-link-visibility.use-case';

import {
  mockCacheService,
  mockLinksRepository,
  mockUsersRepository,
  mockUserWithoutPassword,
} from '../../../__mocks__';

describe('ChangeVisibilityUseCase', () => {
  let changeVisibilityUseCase: ChangeVisibilityUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    changeVisibilityUseCase = new ChangeVisibilityUseCase(
      mockLinksRepository,
      mockUsersRepository,
      mockCacheService as any
    );
  });

  const payload = { id: 'link-123', user_id: 'user-123' };

  it('should change visibility and invalidate cache successfully', async () => {
    mockLinksRepository.changeVisibility.mockResolvedValue([
      undefined,
      'Visibility changed',
    ]);
    mockUsersRepository.findUserById.mockResolvedValue([
      undefined,
      mockUserWithoutPassword,
    ]);

    const [error, result] = await changeVisibilityUseCase.execute(payload);

    expect(error).toBeUndefined();
    expect(result).toBe('Visibility changed');
    expect(mockLinksRepository.changeVisibility).toHaveBeenCalledWith(payload);
    expect(mockCacheService.invalidateLinks).toHaveBeenCalledWith(
      mockUserWithoutPassword.id,
      mockUserWithoutPassword.username
    );
  });

  it('should return error if visibility change fails', async () => {
    const mockError = { message: 'Not found', statusCode: 404 };
    mockLinksRepository.changeVisibility.mockResolvedValue([
      mockError as any,
      '',
    ]);

    const [error] = await changeVisibilityUseCase.execute(payload);

    expect(error).toEqual(mockError);
    expect(mockCacheService.invalidateLinks).not.toHaveBeenCalled();
  });

  it('should change visibility but not invalidate cache if user not found', async () => {
    mockLinksRepository.changeVisibility.mockResolvedValue([
      undefined,
      'Visibility changed',
    ]);
    mockUsersRepository.findUserById.mockResolvedValue([
      { message: 'User not found' } as any,
      null,
    ]);

    const [error, result] = await changeVisibilityUseCase.execute(payload);

    expect(error).toBeUndefined();
    expect(result).toBe('Visibility changed');
    expect(mockCacheService.invalidateLinks).not.toHaveBeenCalled();
  });
});
