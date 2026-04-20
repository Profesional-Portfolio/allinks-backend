import {
  BadRequestException,
  Exception,
  InternalServerErrorException,
  UnauthorizedException,
} from '@/domain/exceptions';
import {
  AuthDatasource,
  EmailVerificationTokenEntity,
  LoginUserDto,
  PasswordResetTokenEntity,
  RegisterUserDto,
  UserWithoutPassword,
} from '@/domain/index';
import { PasswordHasher } from '@/domain/interfaces';
import { PrismaClient } from '@/prisma/client';

import { UserMapper } from '../mappers';

export class AuthDatasourceImpl implements AuthDatasource {
  constructor(
    private readonly passwordHasher: PasswordHasher,
    private readonly prismadb: PrismaClient
  ) {}

  async createEmailVerificationToken(
    userId: UserWithoutPassword['id'],
    token: string,
    expires_at: Date
  ): Promise<[Exception | undefined, EmailVerificationTokenEntity | null]> {
    const emailVerificationToken =
      await this.prismadb.emailVerificationToken.create({
        data: {
          expires_at,
          token,
          user_id: userId,
        },
      });

    return [
      undefined,
      EmailVerificationTokenEntity.fromObject(emailVerificationToken),
    ];
  }

  async createPasswordResetToken(
    userId: UserWithoutPassword['id'],
    token: string,
    expires_at: Date
  ): Promise<[Exception | undefined, null | PasswordResetTokenEntity]> {
    const passwordResetToken = await this.prismadb.passwordResetToken.create({
      data: {
        expires_at: expires_at,
        token,
        user_id: userId,
      },
    });
    return [undefined, PasswordResetTokenEntity.fromObject(passwordResetToken)];
  }

  async deleteUserEmailVerificationTokens(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, null | string]> {
    await this.prismadb.emailVerificationToken.deleteMany({
      where: {
        user_id: userId,
      },
    });
    return [undefined, 'Email verification tokens deleted'];
  }

  async deleteUserPasswordResetTokens(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, null | string]> {
    await this.prismadb.passwordResetToken.deleteMany({
      where: {
        user_id: userId,
      },
    });

    return [undefined, 'Password reset tokens deleted'];
  }

  async findEmailVerificationToken(
    token: string
  ): Promise<[Exception | undefined, EmailVerificationTokenEntity | null]> {
    const emailVerificationToken =
      await this.prismadb.emailVerificationToken.findUnique({
        where: {
          token,
        },
      });

    return [
      undefined,
      emailVerificationToken
        ? EmailVerificationTokenEntity.fromObject(emailVerificationToken)
        : null,
    ];
  }

  async findPasswordResetToken(
    token: string
  ): Promise<[Exception | undefined, null | PasswordResetTokenEntity]> {
    const passwordResetToken =
      await this.prismadb.passwordResetToken.findUnique({
        where: {
          token,
        },
      });
    return [
      undefined,
      passwordResetToken
        ? PasswordResetTokenEntity.fromObject(passwordResetToken)
        : null,
    ];
  }

  async findUserByEmail(
    email: string
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    try {
      const user = await this.prismadb.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        const err = new UnauthorizedException('Invalid credentials');
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
    id: string
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    try {
      const user = await this.prismadb.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        const err = new UnauthorizedException('Invalid credentials');
        return [err, null];
      }

      const mappedUser = UserMapper.toEntity(user, true);

      return [undefined, mappedUser];
    } catch {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async login(
    payload: LoginUserDto
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    try {
      const user = await this.prismadb.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!user) {
        const err = new UnauthorizedException('Invalid credentials');
        return [err, null];
      }

      const isPasswordValid = await this.passwordHasher.compare(
        payload.password,
        user.password_hash
      );

      if (!isPasswordValid) {
        const err = new UnauthorizedException('Invalid credentials');
        return [err, null];
      }

      if (!user.is_active) {
        const err = new UnauthorizedException('Account is inactive');
        return [err, null];
      }

      if (!user.email_verified) {
        const err = new UnauthorizedException('Email is not verified');
        return [err, null];
      }

      await this.prismadb.user.update({
        data: { last_login_at: new Date() },
        where: { id: user.id },
      });

      return [undefined, UserMapper.toEntity(user, true)];
    } catch {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async register(
    payload: RegisterUserDto
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    try {
      const userExists = await this.prismadb.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (userExists) {
        const err = new BadRequestException('User already exists');
        return [err, null];
      }

      const { password, ...payloadWithoutPassword } = payload;

      const user = await this.prismadb.user.create({
        data: {
          ...payloadWithoutPassword,
          password_hash: await this.passwordHasher.hash(password),
        },
      });

      const mappedUser = UserMapper.toEntity(user, true);

      return [undefined, mappedUser];
    } catch (error) {
      console.log('Error registering user: ', error);
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async updateEmailVerificationTokenVerifiedDate(
    tokenId: EmailVerificationTokenEntity['id']
  ): Promise<[Exception | undefined, null | string]> {
    await this.prismadb.emailVerificationToken.update({
      data: {
        verified_at: new Date(),
      },
      where: {
        id: tokenId,
      },
    });
    return [undefined, 'Email verification token used'];
  }

  async updateEmailVerified(
    userId: UserWithoutPassword['id'],
    verified: boolean
  ): Promise<[Exception | undefined, string]> {
    await this.prismadb.user.update({
      data: {
        email_verified: verified,
      },
      where: {
        id: userId,
      },
    });

    return [undefined, 'Email verified'];
  }

  async updateLastLogin(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, string | undefined]> {
    try {
      const user = await this.prismadb.user.update({
        data: {
          last_login_at: new Date(),
        },
        where: {
          id,
        },
      });
      if (!user.id) {
        const err = new UnauthorizedException('Invalid credentials');
        return [err, undefined];
      }
      return [undefined, 'Last login updated'];
    } catch {
      // throw error;
      const err = new InternalServerErrorException();
      return [err, undefined];
    }
  }

  async updatePassword(
    userId: string,
    hashedPassword: string
  ): Promise<[Exception | undefined, null | string]> {
    await this.prismadb.user.update({
      data: {
        password_hash: hashedPassword,
      },
      where: {
        id: userId,
      },
    });
    return [undefined, 'Password updated'];
  }

  async updatePasswordResetTokenUsedDate(
    tokenId: PasswordResetTokenEntity['id']
  ): Promise<[Exception | undefined, null | string]> {
    await this.prismadb.passwordResetToken.update({
      data: {
        used_at: new Date(),
      },
      where: {
        id: tokenId,
      },
    });
    return [undefined, 'Password reset token used'];
  }
}
