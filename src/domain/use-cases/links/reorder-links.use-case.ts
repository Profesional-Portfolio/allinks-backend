import { ReorderLinksDto } from '@/domain/dtos';
import { Exception } from '@/domain/exceptions';
import { LinksRepository, UsersRepository } from '@/domain/repositories';
import { CacheService } from '@/infraestructure/services';

export interface IReorderLinksUseCase {
  execute(payload: ReorderLinksDto): Promise<[Exception | undefined, string]>;
}

export class ReorderLinksUseCase implements IReorderLinksUseCase {
  constructor(
    private readonly linkRepository: LinksRepository,
    private readonly usersRepository: UsersRepository,
    private readonly cacheService: CacheService
  ) {}

  async execute(
    payload: ReorderLinksDto
  ): Promise<[Exception | undefined, string]> {
    const [error, result] = await this.linkRepository.reorderLinks(payload);

    if (!error) {
      // Fetch user to get username for cache invalidation
      const [userError, user] = await this.usersRepository.findUserById(
        payload.user_id
      );
      if (!userError && user) {
        await this.cacheService.invalidateLinks(user.id, user.username);
      }
    }

    return [error, result];
  }
}
