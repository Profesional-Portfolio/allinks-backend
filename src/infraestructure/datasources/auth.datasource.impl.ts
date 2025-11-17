import {
  AuthDatasource,
  LoginUserDto,
  RegisterUserDto,
  UserEntity,
  UserWithoutPassword,
} from '@/domain/index';
import { PasswordHasher } from '@/domain/interfaces';
import {
  BadRequestException,
  UnauthorizedException,
} from '@/infraestructure/http';
import { UserMapper } from '../mappers';
import { Exception, InternalServerErrorException } from '@/domain/exceptions';
import { PrismaClient } from '@/generated/prisma';

export class AuthDatasourceImpl implements AuthDatasource {
  constructor(
    private readonly passwordHasher: PasswordHasher,
    private readonly prismadb: PrismaClient
  ) {}

  async findUserByEmail(
    email: string
  ): Promise<[Exception | undefined, UserWithoutPassword]> {
    try {
      const user = await this.prismadb.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        const err = new UnauthorizedException('Invalid credentials');
        return [err, {} as UserWithoutPassword];
      }

      const mappedUser = UserMapper.userEntityFromObject(user);
      const { password_hash, ...userWithoutPassword } = mappedUser;

      return [undefined, userWithoutPassword];
    } catch (error) {
      const err = new InternalServerErrorException();
      return [err, {} as UserWithoutPassword];
    }
  }

  async findUserById(
    id: string
  ): Promise<[Exception | undefined, UserWithoutPassword]> {
    try {
      const user = await this.prismadb.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        const err = new UnauthorizedException('Invalid credentials');
        return [err, {} as UserWithoutPassword];
      }

      const mappedUser = UserMapper.userEntityFromObject(user, true);

      return [undefined, mappedUser];
    } catch (error) {
      // throw error;
      const err = new InternalServerErrorException();
      return [err, {} as UserWithoutPassword];
    }
  }

  async updateLastLogin(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, string | undefined]> {
    try {
      const user = await this.prismadb.user.update({
        where: {
          id,
        },
        data: {
          last_login_at: new Date(),
        },
      });
      if (!user) {
        const err = new UnauthorizedException('Invalid credentials');
        return [err, undefined];
      }
      return [undefined, 'Last login updated'];
    } catch (error) {
      // throw error;
      const err = new InternalServerErrorException();
      return [err, undefined];
    }
  }

  async register(
    payload: RegisterUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword]> {
    try {
      const userExists = await this.prismadb.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (userExists) {
        // throw new BadRequestException('User already exists');
        const err = new BadRequestException('User already exists');
        return [err, {} as UserWithoutPassword];
      }

      const { password, ...payloadWithoutPassword } = payload;

      const user = await this.prismadb.user.create({
        data: {
          ...payloadWithoutPassword,
          password_hash: await this.passwordHasher.hash(password),
        },
      });

      const mappedUser = UserMapper.userEntityFromObject(user);
      const { password_hash, ...userWithoutPassword } = mappedUser;

      return [undefined, userWithoutPassword];
    } catch (error) {
      // throw error;
      const err = new InternalServerErrorException();
      return [err, {} as UserWithoutPassword];
    }
  }

  async login(
    payload: LoginUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword]> {
    try {
      const user = await this.prismadb.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!user) {
        // throw new UnauthorizedException('Invalid credentials');
        const err = new UnauthorizedException('Invalid credentials');
        return [err, {} as UserWithoutPassword];
      }

      const isPasswordValid = await this.passwordHasher.compare(
        payload.password,
        user.password_hash
      );

      if (!isPasswordValid) {
        // throw new UnauthorizedException('Invalid credentials');
        const err = new UnauthorizedException('Invalid credentials');
        return [err, {} as UserWithoutPassword];
      }

      if (!user.is_active) {
        // throw new UnauthorizedException('Account is inactive');
        const err = new UnauthorizedException('Account is inactive');
        return [err, {} as UserWithoutPassword];
      }

      // Actualizar last_login_at
      await this.prismadb.user.update({
        where: { id: user.id },
        data: { last_login_at: new Date() },
      });

      return [undefined, UserMapper.userEntityFromObject(user, true)];
    } catch (error) {
      // throw error;
      const err = new InternalServerErrorException();
      return [err, {} as UserWithoutPassword];
    }
  }
}
