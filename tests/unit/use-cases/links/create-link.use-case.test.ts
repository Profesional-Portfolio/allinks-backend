import { CreateLinkUseCase } from '@/domain/use-cases/links/create-link.use-case';
import { CreateLinkDto } from '@/domain/dtos';
import { LinkEntity } from '@/domain/entities';
import { mockLinksRepository, mockUsersRepository, mockCacheService, mockUserWithoutPassword } from '../../../__mocks__';
import { Platforms } from '@/domain/enums';

describe('CreateLinkUseCase', () => {
  let createLinkUseCase: CreateLinkUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    createLinkUseCase = new CreateLinkUseCase(
      mockLinksRepository,
      mockUsersRepository,
      mockCacheService as any
    );
  });

  const payload: CreateLinkDto = {
    platform: Platforms.GITHUB,
    url: 'https://github.com/test',
    title: 'Github',
    user_id: 'user-123',
    is_active: true,
  };

  const mockLink: LinkEntity = {
    id: 'link-123',
    user_id: payload.user_id,
    platform: payload.platform as string,
    url: payload.url,
    title: payload.title,
    is_active: payload.is_active,
    display_order: 1,
    created_at: new Date(),
    updated_at: new Date(),
  };

  it('should create a link and invalidate cache successfully', async () => {
    mockLinksRepository.createLink.mockResolvedValue([undefined, mockLink]);
    mockUsersRepository.findUserById.mockResolvedValue([undefined, mockUserWithoutPassword]);

    const [error, result] = await createLinkUseCase.execute(payload);

    expect(error).toBeUndefined();
    expect(result).toEqual(mockLink);
    expect(mockLinksRepository.createLink).toHaveBeenCalledWith(payload);
    expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(payload.user_id);
    expect(mockCacheService.invalidateLinks).toHaveBeenCalledWith(
      mockUserWithoutPassword.id,
      mockUserWithoutPassword.username
    );
  });

  it('should return error if link creation fails', async () => {
    const mockError = { message: 'Creation failed', statusCode: 400 };
    mockLinksRepository.createLink.mockResolvedValue([mockError as any, null]);

    const [error, result] = await createLinkUseCase.execute(payload);

    expect(error).toEqual(mockError);
    expect(result).toBeNull();
    expect(mockCacheService.invalidateLinks).not.toHaveBeenCalled();
  });

  it('should create link but not invalidate cache if user not found', async () => {
    mockLinksRepository.createLink.mockResolvedValue([undefined, mockLink]);
    mockUsersRepository.findUserById.mockResolvedValue([{ message: 'User not found' } as any, null]);

    const [error, result] = await createLinkUseCase.execute(payload);

    expect(error).toBeUndefined();
    expect(result).toEqual(mockLink);
    expect(mockCacheService.invalidateLinks).not.toHaveBeenCalled();
  });
});
