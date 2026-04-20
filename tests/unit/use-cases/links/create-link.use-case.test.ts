import { CreateLinkDto } from '@/domain/dtos';
import { LinkEntity } from '@/domain/entities';
import { Platforms } from '@/domain/enums';
import { CreateLinkUseCase } from '@/domain/use-cases/links/create-link.use-case';

import {
  mockCacheService,
  mockLinksRepository,
  mockUsersRepository,
  mockUserWithoutPassword,
} from '../../../__mocks__';

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
    is_active: true,
    platform: Platforms.GITHUB,
    title: 'Github',
    url: 'https://github.com/test',
    user_id: 'user-123',
  };

  const mockLink: LinkEntity = {
    created_at: new Date(),
    display_order: 1,
    id: 'link-123',
    is_active: payload.is_active,
    platform: payload.platform as string,
    title: payload.title,
    updated_at: new Date(),
    url: payload.url,
    user_id: payload.user_id,
  };

  it('should create a link and invalidate cache successfully', async () => {
    mockLinksRepository.createLink.mockResolvedValue([undefined, mockLink]);
    mockUsersRepository.findUserById.mockResolvedValue([
      undefined,
      mockUserWithoutPassword,
    ]);

    const [error, result] = await createLinkUseCase.execute(payload);

    expect(error).toBeUndefined();
    expect(result).toEqual(mockLink);
    expect(mockLinksRepository.createLink).toHaveBeenCalledWith(payload);
    expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(
      payload.user_id
    );
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
    mockUsersRepository.findUserById.mockResolvedValue([
      { message: 'User not found' } as any,
      null,
    ]);

    const [error, result] = await createLinkUseCase.execute(payload);

    expect(error).toBeUndefined();
    expect(result).toEqual(mockLink);
    expect(mockCacheService.invalidateLinks).not.toHaveBeenCalled();
  });
});
