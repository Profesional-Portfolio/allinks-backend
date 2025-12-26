import { IdDto, UserIdDto } from '@/domain/dtos';
import { Exception } from '@/domain/exceptions';
import { LinksRepository, UsersRepository } from '@/domain/repositories';
import { CacheService } from '@/infraestructure/services';

export interface IChangeVisibilityUseCase {
  execute(payload: IdDto & UserIdDto): Promise<[Exception | undefined, string]>;
}

export class ChangeVisibilityUseCase implements IChangeVisibilityUseCase {
  constructor(
    private readonly linkRepository: LinksRepository,
    private readonly usersRepository: UsersRepository,
    private readonly cacheService: CacheService
  ) {}

  async execute(
    payload: IdDto & UserIdDto
  ): Promise<[Exception | undefined, string]> {
    const [error, result] = await this.linkRepository.changeVisibility(payload);

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
