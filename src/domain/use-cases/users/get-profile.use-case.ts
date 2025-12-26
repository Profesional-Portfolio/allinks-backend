import {
  Exception,
  UserWithoutPassword,
  UsersRepository,
} from '@/domain/index';
import { CacheService } from '@/infraestructure/services';

interface IGetProfileUseCase {
  execute(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, UserWithoutPassword | null]>;
}

export class GetProfileUseCase implements IGetProfileUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cacheService: CacheService
  ) {}

  execute = async (
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> => {
    // 1. Try to get from cache
    const cachedUser = await this.cacheService.getUserProfile(id);
    if (cachedUser) {
      return [undefined, cachedUser];
    }

    // 2. If not in cache, get from repository
    const [error, user] = await this.usersRepository.findUserById(id);

    // 3. Save to cache if successful
    if (!error && user) {
      await this.cacheService.setUserProfile(id, user);
    }

    return [error, user];
  };
}
