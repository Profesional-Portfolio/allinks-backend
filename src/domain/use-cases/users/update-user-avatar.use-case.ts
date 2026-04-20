import { CacheService } from '@/infraestructure/services';

import { Exception, UsersRepository, UserWithoutPassword } from '../..';

interface IUpdateUserAvatarUseCase {
  execute(
    id: UserWithoutPassword['id'],
    avatarUrl: string
  ): Promise<[Exception | null, null | string]>;
}

export class UpdateUserAvatarUseCase implements IUpdateUserAvatarUseCase {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly cacheService: CacheService
  ) {}

  async execute(
    id: UserWithoutPassword['id'],
    avatarUrl: string
  ): Promise<[Exception | null, null | string]> {
    const [error, user] = await this.userRepository.updateAvatarUser(
      id,
      avatarUrl
    );

    if (!error && user) {
      await this.cacheService.invalidateProfile(user.id, user.username);
    }

    if (error) {
      return [error, null];
    }

    return [null, user?.avatar_url ?? null];
  }
}
