import {
  Exception,
  UserWithoutPassword,
  UsersRepository,
} from '@/domain/index';

interface IGetProfileUseCase {
  execute(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, UserWithoutPassword | null]>;
}

export class GetProfileUseCase implements IGetProfileUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  execute = async (id: UserWithoutPassword['id']) => {
    return await this.usersRepository.findUserById(id);
  };
}
