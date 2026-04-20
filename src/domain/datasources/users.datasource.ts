import { UpdateProfileUserDto } from '../dtos';
import { LinkEntity, UserWithoutPassword } from '../entities';
import { Exception } from '../exceptions';

export abstract class UsersDatasource {
  abstract checkUsernameAvailability(
    username: string
  ): Promise<[Exception | undefined, boolean]>;

  abstract deleteAvatarUser(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, null | UserWithoutPassword]>;

  abstract findUserByEmail(
    email: string
  ): Promise<[Exception | undefined, null | UserWithoutPassword]>;

  abstract findUserById(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, null | UserWithoutPassword]>;

  abstract findUserByUsername(
    username: string
  ): Promise<[Exception | undefined, null | UserWithoutPassword]>;

  abstract findUserWithLinksByUsername(
    username: string
  ): Promise<
    [
      Exception | undefined,
      null | (UserWithoutPassword & { links: LinkEntity[] }),
    ]
  >;

  abstract updateAvatarUser(
    userId: UserWithoutPassword['id'],
    avatarUrl: string
  ): Promise<[Exception | undefined, null | UserWithoutPassword]>;

  abstract updateProfileUser(
    userId: UserWithoutPassword['id'],
    payload: UpdateProfileUserDto
  ): Promise<[Exception | undefined, null | UserWithoutPassword]>;
}
