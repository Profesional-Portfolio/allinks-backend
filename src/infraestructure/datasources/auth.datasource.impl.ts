import {
  AuthDatasource,
  LoginUserDto,
  RegisterUserDto,
  UserEntity,
  UserWithoutPassword,
} from '@/domain/index';
import { PasswordHasher } from '@/domain/interfaces';
import { prismadb } from '@/infraestructure/prismadb';
import {
  BadRequestException,
  UnauthorizedException,
} from '@/infraestructure/http';
import { UserMapper } from '../mappers';

export class AuthDatasourceImpl implements AuthDatasource {
  constructor(private readonly passwordHasher: PasswordHasher) {}

  async register(payload: RegisterUserDto): Promise<UserWithoutPassword> {
    try {
      const userExists = await prismadb.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (userExists) {
        throw new BadRequestException('User already exists');
      }

      const { password, ...payloadWithoutPassword } = payload;

      const user = await prismadb.user.create({
        data: {
          ...payloadWithoutPassword,
          password_hash: await this.passwordHasher.hash(password),
        },
      });

      const mappedUser = UserMapper.userEntityFromObject(user);
      const { password_hash, ...userWithoutPassword } = mappedUser;

      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  async login(payload: LoginUserDto): Promise<UserEntity> {
    try {
      const user = await prismadb.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await this.passwordHasher.compare(
        payload.password,
        user.password_hash
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.is_active) {
        throw new UnauthorizedException('Account is inactive');
      }

      // Actualizar last_login_at
      await prismadb.user.update({
        where: { id: user.id },
        data: { last_login_at: new Date() },
      });

      return UserMapper.userEntityFromObject(user);
    } catch (error) {
      throw error;
    }
  }
}
