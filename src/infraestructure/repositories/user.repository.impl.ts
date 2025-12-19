import { UsersDatasource } from '@/domain/datasources';
import {
  UsersRepository,
  Exception,
  UpdateProfileUserDto,
  UserWithoutPassword,
  LinkEntity,
} from '@/domain/index';

export class UsersRepositoryImpl implements UsersRepository {
  constructor(private readonly usersDatasource: UsersDatasource) {}
  async findUserWithLinksByUsername(
    username: string
  ): Promise<
    [
      Exception | undefined,
      (UserWithoutPassword & { links: LinkEntity[] }) | null,
    ]
  > {
    return this.usersDatasource.findUserWithLinksByUsername(username);
  }

  async findUserByUsername(
    username: string
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
    return this.usersDatasource.findUserByUsername(username);
  }

  async findUserByEmail(
    email: string
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
    return this.usersDatasource.findUserByEmail(email);
  }

  async findUserById(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
    return this.usersDatasource.findUserById(id);
  }

  async checkUsernameAvailability(
    username: string
  ): Promise<[Exception | undefined, boolean]> {
    return this.usersDatasource.checkUsernameAvailability(username);
  }

  async updateProfileUser(
    userId: UserWithoutPassword['id'],
    payload: UpdateProfileUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
    return this.usersDatasource.updateProfileUser(userId, payload);
  }

  async updateAvatarUser(
    userId: UserWithoutPassword['id'],
    avatarUrl: string
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
    return this.usersDatasource.updateAvatarUser(userId, avatarUrl);
  }

  async deleteAvatarUser(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
    return this.usersDatasource.deleteAvatarUser(userId);
  }
}
