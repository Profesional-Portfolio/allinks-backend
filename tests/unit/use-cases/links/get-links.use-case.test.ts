import { LinkEntity } from '@/domain/entities';
import { GetLinksUseCase } from '@/domain/use-cases/links/get-links.use-case';

import {
  mockCacheService,
  mockLinksArrays,
  mockLinksRepository,
} from '../../../__mocks__';

describe('GetLinksUseCase', () => {
  let getLinksUseCase: GetLinksUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    getLinksUseCase = new GetLinksUseCase(
      mockLinksRepository,
      mockCacheService as any
    );
  });

  const userIdDto = { user_id: 'user-1' };
  const mockLinks: LinkEntity[] = mockLinksArrays[0];

  it('should return cached links if they exist', async () => {
    mockCacheService.getUserLinks.mockResolvedValue(mockLinks);

    const [error, links] = await getLinksUseCase.execute(userIdDto);

    expect(error).toBeUndefined();
    expect(links).toEqual(mockLinks);
    expect(mockLinksRepository.getLinks).not.toHaveBeenCalled();
  });

  it('should fetch from repository and cache if cache is empty', async () => {
    mockCacheService.getUserLinks.mockResolvedValue(null);
    mockLinksRepository.getLinks.mockResolvedValue([undefined, mockLinks]);
    mockCacheService.setUserLinks.mockResolvedValue(undefined);

    const [error, links] = await getLinksUseCase.execute(userIdDto);

    expect(error).toBeUndefined();
    expect(links).toEqual(mockLinks);
    expect(mockLinksRepository.getLinks).toHaveBeenCalledWith(userIdDto);
    expect(mockCacheService.setUserLinks).toHaveBeenCalledWith(
      userIdDto.user_id,
      mockLinks
    );
  });

  it('should return error if repository fails', async () => {
    mockCacheService.getUserLinks.mockResolvedValue(null);
    const mockError = { message: 'Repository error', statusCode: 500 };
    mockLinksRepository.getLinks.mockResolvedValue([mockError as any, []]);

    const [error] = await getLinksUseCase.execute(userIdDto);

    expect(error).toEqual(mockError);
    expect(mockCacheService.setUserLinks).not.toHaveBeenCalled();
  });
});
