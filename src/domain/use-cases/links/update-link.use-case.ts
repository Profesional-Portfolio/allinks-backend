import { LinkEntity } from '@/domain/entities';
import { UpdateLinkDto } from '@/domain/dtos';
import { LinksRepository, UsersRepository } from '@/domain/repositories';
import { Exception } from '@/domain/exceptions';
import { CacheService } from '@/infraestructure/services';

interface IUpdateLinkUseCase {
  execute(
    payload: UpdateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]>;
}

export class UpdateLinkUseCase implements IUpdateLinkUseCase {
  constructor(
    private readonly linkRepository: LinksRepository,
    private readonly usersRepository: UsersRepository,
    private readonly cacheService: CacheService
  ) {}

  async execute(
    payload: UpdateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]> {
    const [error, link] = await this.linkRepository.updateLink(payload);

    if (!error && link) {
      // Fetch user to get username for cache invalidation
      const [userError, user] = await this.usersRepository.findUserById(
        payload.user_id
      );
      if (!userError && user) {
        await this.cacheService.invalidateLinks(user.id, user.username);
      }
    }

    return [error, link];
  }
}
