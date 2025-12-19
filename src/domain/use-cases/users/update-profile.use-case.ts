import {
  Exception,
  IdDto,
  UpdateProfileUserDto,
  UserWithoutPassword,
  UsersRepository,
} from '@/domain/index';

interface IUpdateProfileUseCase {
  execute(
    userId: UserWithoutPassword['id'],
    data: UpdateProfileUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword | null]>;
}

export class UpdateProfileUseCase implements IUpdateProfileUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  execute = async (
    userId: UserWithoutPassword['id'],
    data: UpdateProfileUserDto
  ) => {
    return await this.usersRepository.updateProfileUser(userId, data);
  };
}
