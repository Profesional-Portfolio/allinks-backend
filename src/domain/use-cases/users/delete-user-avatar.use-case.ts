import { Exception, UserWithoutPassword, UsersRepository } from '../..';
import { CacheService } from '@/infraestructure/services';

interface IDeleteUserAvatarUseCase {
  execute(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | null, string | null]>;
}

export class DeleteUserAvatarUseCase implements IDeleteUserAvatarUseCase {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly cacheService: CacheService
  ) {}

  async execute(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | null, string | null]> {
    const [error, user] = await this.userRepository.deleteAvatarUser(id);

    if (!error && user) {
      await this.cacheService.invalidateProfile(user.id, user.username);
    }

    if (error) {
      return [error, null];
    }

    return [null, 'Avatar deleted successfully'];
  }
}
