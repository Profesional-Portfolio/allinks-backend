import { Exception, UserWithoutPassword, UsersRepository } from '../..';

interface IDeleteUserAvatarUseCase {
  execute(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | null, string | null]>;
}

export class DeleteUserAvatarUseCase implements IDeleteUserAvatarUseCase {
  constructor(private readonly userRepository: UsersRepository) {}

  async execute(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | null, string | null]> {
    const [error] = await this.userRepository.deleteAvatarUser(id);

    if (error) {
      return [error, null];
    }

    return [null, 'Avatar deleted successfully'];
  }
}
