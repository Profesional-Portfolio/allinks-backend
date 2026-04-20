import { CacheService } from '@/infraestructure/services';

import { Exception, UsersRepository, UserWithoutPassword } from '../..';

interface IDeleteUserAvatarUseCase {
  execute(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | null, null | string]>;
}

export class DeleteUserAvatarUseCase implements IDeleteUserAvatarUseCase {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly cacheService: CacheService
  ) {}

  async execute(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | null, null | string]> {
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
