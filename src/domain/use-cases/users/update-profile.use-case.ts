import {
  Exception,
  UpdateProfileUserDto,
  UserWithoutPassword,
  UsersRepository,
} from '@/domain/index';
import { CacheService } from '@/infraestructure/services';

interface IUpdateProfileUseCase {
  execute(
    userId: UserWithoutPassword['id'],
    data: UpdateProfileUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword | null]>;
}

export class UpdateProfileUseCase implements IUpdateProfileUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cacheService: CacheService
  ) {}

  execute = async (
    userId: UserWithoutPassword['id'],
    data: UpdateProfileUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> => {
    const [error, user] = await this.usersRepository.updateProfileUser(
      userId,
      data
    );

    if (!error && user) {
      await this.cacheService.invalidateProfile(user.id, user.username);
    }

    return [error, user];
  };
}
