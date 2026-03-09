import { ReorderLinksUseCase } from '@/domain/use-cases/links/reorder-links.use-case';
import {
  mockLinksRepository,
  mockUsersRepository,
  mockCacheService,
  mockUserWithoutPassword,
} from '../../../__mocks__';

describe('ReorderLinksUseCase', () => {
  let reorderLinksUseCase: ReorderLinksUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    reorderLinksUseCase = new ReorderLinksUseCase(
      mockLinksRepository,
      mockUsersRepository,
      mockCacheService as any
    );
  });

  const payload = {
    user_id: 'user-123',
    links: [
      { id: 'link-1', display_order: 1 },
      { id: 'link-2', display_order: 2 },
    ],
  };

  it('should reorder links and invalidate cache successfully', async () => {
    mockLinksRepository.reorderLinks.mockResolvedValue([undefined, 'Links reordered']);
    mockUsersRepository.findUserById.mockResolvedValue([undefined, mockUserWithoutPassword]);

    const [error, result] = await reorderLinksUseCase.execute(payload);

    expect(error).toBeUndefined();
    expect(result).toBe('Links reordered');
    expect(mockLinksRepository.reorderLinks).toHaveBeenCalledWith(payload);
    expect(mockCacheService.invalidateLinks).toHaveBeenCalledWith(
      mockUserWithoutPassword.id,
      mockUserWithoutPassword.username
    );
  });

  it('should return error if reorder fails', async () => {
    const mockError = { message: 'Reorder failed', statusCode: 400 };
    mockLinksRepository.reorderLinks.mockResolvedValue([mockError as any, '']);

    const [error] = await reorderLinksUseCase.execute(payload);

    expect(error).toEqual(mockError);
    expect(mockCacheService.invalidateLinks).not.toHaveBeenCalled();
  });

  it('should reorder links but not invalidate cache if user not found', async () => {
    mockLinksRepository.reorderLinks.mockResolvedValue([undefined, 'Links reordered']);
    mockUsersRepository.findUserById.mockResolvedValue([
      { message: 'User not found' } as any,
      null,
    ]);

    const [error, result] = await reorderLinksUseCase.execute(payload);

    expect(error).toBeUndefined();
    expect(result).toBe('Links reordered');
    expect(mockCacheService.invalidateLinks).not.toHaveBeenCalled();
  });
});
