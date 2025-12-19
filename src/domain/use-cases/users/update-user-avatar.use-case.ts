import { Exception, UserWithoutPassword, UsersRepository } from '../..';

interface IUpdateUserAvatarUseCase {
  execute(
    id: UserWithoutPassword['id'],
    avatarUrl: string
  ): Promise<[Exception | null, string | null]>;
}

export class UpdateUserAvatarUseCase implements IUpdateUserAvatarUseCase {
  constructor(private readonly userRepository: UsersRepository) {}

  async execute(
    id: UserWithoutPassword['id'],
    avatarUrl: string
  ): Promise<[Exception | null, string | null]> {
    const [error, user] = await this.userRepository.updateAvatarUser(
      id,
      avatarUrl
    );

    if (error) {
      return [error, null];
    }

    return [null, user?.avatar_url as string];
  }
}
