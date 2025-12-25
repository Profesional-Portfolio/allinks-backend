import {
  Exception,
  LinkEntity,
  UserWithoutPassword,
  UsersRepository,
} from '@/domain/index';
import { CacheService } from '@/infraestructure/services';

interface IGetPublicProfileUseCase {
  execute(
    username: string
  ): Promise<
    [
      Exception | undefined,
      (UserWithoutPassword & { links: LinkEntity[] }) | null,
    ]
  >;
}

export class GetPublicProfileUseCase implements IGetPublicProfileUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cacheService: CacheService
  ) {}

  execute = async (
    username: string
  ): Promise<
    [
      Exception | undefined,
      (UserWithoutPassword & { links: LinkEntity[] }) | null,
    ]
  > => {
    // 1. Try to get from cache
    const cachedProfile = await this.cacheService.getPublicProfile(username);
    if (cachedProfile) {
      return [undefined, cachedProfile];
    }

    // 2. If not in cache, get from repository
    const [error, profile] =
      await this.usersRepository.findUserWithLinksByUsername(username);

    // 3. Save to cache if successful
    if (!error && profile) {
      await this.cacheService.setPublicProfile(username, profile);
    }

    return [error, profile];
  };
}
