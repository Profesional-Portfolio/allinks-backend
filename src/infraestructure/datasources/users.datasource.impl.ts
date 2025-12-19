import { UsersDatasource } from '@/domain/datasources';
import prismadb from '../prismadb';
import { LinkEntity, UserWithoutPassword } from '@/domain/entities';
import {
  Exception,
  InternalServerErrorException,
  NotFoundException,
} from '@/domain/exceptions';
import { UpdateProfileUserDto } from '@/domain/dtos';
import { LinkMapper, UserMapper } from '../mappers';

export class UsersDatasourceImpl implements UsersDatasource {
  async findUserWithLinksByUsername(
    username: string
  ): Promise<
    [
      Exception | undefined,
      (UserWithoutPassword & { links: LinkEntity[] }) | null,
    ]
  > {
    try {
      const user = await prismadb.user.findUnique({
        where: {
          username,
        },
        include: {
          links: true,
        },
      });

      if (!user) {
        const err = new NotFoundException('User not found');
        return [err, null];
      }

      const mappedUser = UserMapper.toEntity(user, true);
      const mappedLinks = user.links.map(link => LinkMapper.toEntity(link));

      return [undefined, { ...mappedUser, links: mappedLinks }];
    } catch (error) {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async findUserByUsername(
    username: string
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
    try {
      const user = await prismadb.user.findUnique({
        where: {
          username,
        },
      });

      if (!user) {
        const err = new NotFoundException('User not found');
        return [err, null];
      }

      const mappedUser = UserMapper.toEntity(user, true);

      return [undefined, mappedUser];
    } catch (error) {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async findUserByEmail(
    email: string
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
    try {
      const user = await prismadb.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        const err = new NotFoundException('User not found');
        return [err, null];
      }

      const mappedUser = UserMapper.toEntity(user, true);

      return [undefined, mappedUser];
    } catch (error) {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async findUserById(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
    try {
      const user = await prismadb.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        const err = new NotFoundException('User not found');
        return [err, null];
      }

      const mappedUser = UserMapper.toEntity(user, true);

      return [undefined, mappedUser];
    } catch (error) {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async checkUsernameAvailability(
    username: string
  ): Promise<[Exception | undefined, boolean]> {
    try {
      const user = await prismadb.user.findUnique({
        where: {
          username,
        },
      });

      return [undefined, !!user];
    } catch (error) {
      const err = new InternalServerErrorException();
      return [err, false];
    }
  }

  async updateProfileUser(
    userId: UserWithoutPassword['id'],
    payload: UpdateProfileUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
    try {
      const user = await prismadb.user.update({
        where: {
          id: userId,
        },
        data: {
          ...payload,
        },
      });

      if (!user) {
        const err = new NotFoundException('User not found');
        return [err, null];
      }

      const mappedUser = UserMapper.toEntity(user, true);

      return [undefined, mappedUser];
    } catch (error) {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async updateAvatarUser(
    userId: UserWithoutPassword['id'],
    avatarUrl: string
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
    try {
      const user = await prismadb.user.update({
        where: {
          id: userId,
        },
        data: {
          avatar_url: avatarUrl,
        },
      });

      if (!user) {
        const err = new NotFoundException('User not found');
        return [err, null];
      }

      const mappedUser = UserMapper.toEntity(user, true);

      return [undefined, mappedUser];
    } catch (error) {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async deleteAvatarUser(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
    try {
      const user = await prismadb.user.update({
        where: {
          id: userId,
        },
        data: {
          avatar_url: null,
        },
      });

      if (!user) {
        const err = new NotFoundException('User not found');
        return [err, null];
      }

      const mappedUser = UserMapper.toEntity(user, true);

      return [undefined, mappedUser];
    } catch (error) {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }
}
