import {
  Exception,
  LinkEntity,
  UserWithoutPassword,
  UsersRepository,
} from '@/domain/index';

interface IGetPublicProfileUseCase {
  execute(
    username: string
  ): Promise<
    [
      Exception | undefined,
      (UserWithoutPassword & { links: LinkEntity[] }) | null,
    ]
  >;
}

export class GetPublicProfileUseCase implements IGetPublicProfileUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  execute = async (username: string) => {
    return await this.usersRepository.findUserWithLinksByUsername(username);
  };
}
