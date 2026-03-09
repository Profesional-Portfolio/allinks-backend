import { UpdateLinkUseCase } from '@/domain/use-cases/links/update-link.use-case';
import { UpdateLinkDto } from '@/domain/dtos';
import { LinkEntity } from '@/domain/entities';
import { mockLinksRepository, mockUsersRepository, mockCacheService, mockUserWithoutPassword } from '../../../__mocks__';
import { Platforms } from '@/domain/enums';

describe('UpdateLinkUseCase', () => {
  let updateLinkUseCase: UpdateLinkUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    updateLinkUseCase = new UpdateLinkUseCase(
      mockLinksRepository,
      mockUsersRepository,
      mockCacheService as any
    );
  });

  const payload: UpdateLinkDto = {
    id: 'link-123',
    platform: Platforms.TWITCH,
    url: 'https://twitch.tv/test',
    title: 'Twitch',
    user_id: 'user-123',
    is_active: true,
  };

  const mockLink: LinkEntity = {
    id: payload.id as string,
    user_id: payload.user_id,
    platform: payload.platform as string,
    url: payload.url as string,
    title: payload.title as string,
    is_active: payload.is_active as boolean,
    display_order: 1,
    created_at: new Date(),
    updated_at: new Date(),
  };

  it('should update a link and invalidate cache successfully', async () => {
    mockLinksRepository.updateLink.mockResolvedValue([undefined, mockLink]);
    mockUsersRepository.findUserById.mockResolvedValue([undefined, mockUserWithoutPassword]);

    const [error, result] = await updateLinkUseCase.execute(payload);

    expect(error).toBeUndefined();
    expect(result).toEqual(mockLink);
    expect(mockLinksRepository.updateLink).toHaveBeenCalledWith(payload);
    expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(payload.user_id);
    expect(mockCacheService.invalidateLinks).toHaveBeenCalledWith(
      mockUserWithoutPassword.id,
      mockUserWithoutPassword.username
    );
  });

  it('should return error if link update fails', async () => {
    const mockError = { message: 'Update failed', statusCode: 400 };
    mockLinksRepository.updateLink.mockResolvedValue([mockError as any, null]);

    const [error, result] = await updateLinkUseCase.execute(payload);

    expect(error).toEqual(mockError);
    expect(result).toBeNull();
    expect(mockCacheService.invalidateLinks).not.toHaveBeenCalled();
  });

  it('should update link but not invalidate cache if user not found', async () => {
    mockLinksRepository.updateLink.mockResolvedValue([undefined, mockLink]);
    mockUsersRepository.findUserById.mockResolvedValue([{ message: 'User not found' } as any, null]);

    const [error, result] = await updateLinkUseCase.execute(payload);

    expect(error).toBeUndefined();
    expect(result).toEqual(mockLink);
    expect(mockCacheService.invalidateLinks).not.toHaveBeenCalled();
  });
});
