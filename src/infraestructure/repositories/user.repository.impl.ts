import { UsersDatasource } from '@/domain/datasources';
import {
  Exception,
  LinkEntity,
  UpdateProfileUserDto,
  UsersRepository,
  UserWithoutPassword,
} from '@/domain/index';

export class UsersRepositoryImpl implements UsersRepository {
  constructor(private readonly usersDatasource: UsersDatasource) {}
  async checkUsernameAvailability(
    username: string
  ): Promise<[Exception | undefined, boolean]> {
    return this.usersDatasource.checkUsernameAvailability(username);
  }

  async deleteAvatarUser(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    return this.usersDatasource.deleteAvatarUser(userId);
  }

  async findUserByEmail(
    email: string
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    return this.usersDatasource.findUserByEmail(email);
  }

  async findUserById(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    return this.usersDatasource.findUserById(id);
  }

  async findUserByUsername(
    username: string
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    return this.usersDatasource.findUserByUsername(username);
  }

  async findUserWithLinksByUsername(
    username: string
  ): Promise<
    [
      Exception | undefined,
      null | (UserWithoutPassword & { links: LinkEntity[] }),
    ]
  > {
    return this.usersDatasource.findUserWithLinksByUsername(username);
  }

  async updateAvatarUser(
    userId: UserWithoutPassword['id'],
    avatarUrl: string
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    return this.usersDatasource.updateAvatarUser(userId, avatarUrl);
  }

  async updateProfileUser(
    userId: UserWithoutPassword['id'],
    payload: UpdateProfileUserDto
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    return this.usersDatasource.updateProfileUser(userId, payload);
  }
}
