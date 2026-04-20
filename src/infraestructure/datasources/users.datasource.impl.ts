import { UsersDatasource } from '@/domain/datasources';
import { UpdateProfileUserDto } from '@/domain/dtos';
import { LinkEntity, UserWithoutPassword } from '@/domain/entities';
import {
  Exception,
  InternalServerErrorException,
  NotFoundException,
} from '@/domain/exceptions';

import { LinkMapper, UserMapper } from '../mappers';
import prismadb from '../prismadb';

export class UsersDatasourceImpl implements UsersDatasource {
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
    } catch {
      const err = new InternalServerErrorException();
      return [err, false];
    }
  }

  async deleteAvatarUser(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    try {
      const user = await prismadb.user.update({
        data: {
          avatar_url: null,
        },
        where: {
          id: userId,
        },
      });

      const mappedUser = UserMapper.toEntity(user, true);

      return [undefined, mappedUser];
    } catch {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async findUserByEmail(
    email: string
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
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
    } catch {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async findUserById(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
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
    } catch {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async findUserByUsername(
    username: string
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
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
    } catch {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async findUserWithLinksByUsername(
    username: string
  ): Promise<
    [
      Exception | undefined,
      null | (UserWithoutPassword & { links: LinkEntity[] }),
    ]
  > {
    try {
      const user = await prismadb.user.findUnique({
        include: {
          links: true,
        },
        where: {
          username,
        },
      });

      if (!user) {
        const err = new NotFoundException('User not found');
        return [err, null];
      }

      const mappedUser = UserMapper.toEntity(user, true);
      const mappedLinks = user.links.map(link => LinkMapper.toEntity(link));

      return [undefined, Object.assign(mappedUser, { links: mappedLinks })];
    } catch {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async updateAvatarUser(
    userId: UserWithoutPassword['id'],
    avatarUrl: string
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    try {
      const user = await prismadb.user.update({
        data: {
          avatar_url: avatarUrl,
        },
        where: {
          id: userId,
        },
      });

      const mappedUser = UserMapper.toEntity(user, true);

      return [undefined, mappedUser];
    } catch {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async updateProfileUser(
    userId: UserWithoutPassword['id'],
    payload: UpdateProfileUserDto
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    try {
      const user = await prismadb.user.update({
        data: {
          ...payload,
        },
        where: {
          id: userId,
        },
      });

      const mappedUser = UserMapper.toEntity(user, true);

      return [undefined, mappedUser];
    } catch {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }
}
