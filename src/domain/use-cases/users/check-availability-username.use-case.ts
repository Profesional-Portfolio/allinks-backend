import { Exception, UsersRepository } from '@/domain/index';

interface ICheckAvailabilityUsernameUseCase {
  execute(username: string): Promise<[Exception | undefined, boolean]>;
}

export class CheckAvailabilityUsernameUseCase
  implements ICheckAvailabilityUsernameUseCase
{
  constructor(private readonly usersRepository: UsersRepository) {}

  execute = async (username: string) => {
    return await this.usersRepository.checkUsernameAvailability(username);
  };
}
