import { UpdateProfileUserDto } from '../dtos';
import { LinkEntity, UserWithoutPassword } from '../entities';
import { Exception } from '../exceptions';

export abstract class UsersRepository {
  abstract findUserWithLinksByUsername(
    username: string
  ): Promise<
    [
      Exception | undefined,
      (UserWithoutPassword & { links: LinkEntity[] }) | null,
    ]
  >;

  abstract findUserByUsername(
    username: string
  ): Promise<[Exception | undefined, UserWithoutPassword | null]>;

  abstract findUserByEmail(
    email: string
  ): Promise<[Exception | undefined, UserWithoutPassword | null]>;

  abstract findUserById(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, UserWithoutPassword | null]>;

  abstract checkUsernameAvailability(
    username: string
  ): Promise<[Exception | undefined, boolean]>;

  abstract updateProfileUser(
    userId: UserWithoutPassword['id'],
    payload: UpdateProfileUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword | null]>;

  abstract updateAvatarUser(
    userId: UserWithoutPassword['id'],
    avatarUrl: string
  ): Promise<[Exception | undefined, UserWithoutPassword | null]>;

  abstract deleteAvatarUser(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, UserWithoutPassword | null]>;
}
