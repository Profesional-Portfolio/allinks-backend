import { UserIdDto } from '@/domain/dtos';
import { LinkEntity } from '@/domain/entities';
import { Exception } from '@/domain/exceptions';
import { LinksRepository } from '@/domain/repositories';
import { CacheService } from '@/infraestructure/services';

export interface IGetLinksUseCase {
  execute(userIdDto: UserIdDto): Promise<[Exception | undefined, LinkEntity[]]>;
}

export class GetLinksUseCase implements IGetLinksUseCase {
  constructor(
    private readonly linkRepository: LinksRepository,
    private readonly cacheService: CacheService
  ) {}

  async execute(
    userIdDto: UserIdDto
  ): Promise<[Exception | undefined, LinkEntity[]]> {
    // 1. Try to get from cache
    const cachedLinks = await this.cacheService.getUserLinks(userIdDto.user_id);
    if (cachedLinks) {
      return [undefined, cachedLinks];
    }

    // 2. If not in cache, get from repository
    const [error, links] = await this.linkRepository.getLinks(userIdDto);

    // 3. Save to cache if successful
    if (!error && links) {
      await this.cacheService.setUserLinks(userIdDto.user_id, links);
    }

    return [error, links];
  }
}
