import {
  AuthDatasource,
  EmailVerificationTokenEntity,
  LoginUserDto,
  PasswordResetTokenEntity,
  RegisterUserDto,
  UserWithoutPassword,
} from '@/domain/index';
import { PasswordHasher } from '@/domain/interfaces';
import { UserMapper } from '../mappers';
import {
  Exception,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
} from '@/domain/exceptions';
import { PrismaClient } from '@/generated/prisma/client';

export class AuthDatasourceImpl implements AuthDatasource {
  constructor(
    private readonly passwordHasher: PasswordHasher,
    private readonly prismadb: PrismaClient
  ) {}

  async findUserByEmail(
    email: string
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
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
    } catch (error) {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async findUserById(
    id: string
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
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
    } catch (error) {
      const err = new InternalServerErrorException();
      return [err, null];
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
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
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
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async login(
    payload: LoginUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
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
        where: { id: user.id },
        data: { last_login_at: new Date() },
      });

      return [undefined, UserMapper.toEntity(user, true)];
    } catch (error) {
      const err = new InternalServerErrorException();
      return [err, null];
    }
  }

  async updateEmailVerified(
    userId: UserWithoutPassword['id'],
    verified: boolean
  ): Promise<[Exception | undefined, string]> {
    await this.prismadb.user.update({
      where: {
        id: userId,
      },
      data: {
        email_verified: verified,
      },
    });

    return [undefined, 'Email verified'];
  }

  async createEmailVerificationToken(
    userId: UserWithoutPassword['id'],
    token: string,
    expires_at: Date
  ): Promise<[Exception | undefined, EmailVerificationTokenEntity | null]> {
    const emailVerificationToken =
      await this.prismadb.emailVerificationToken.create({
        data: {
          user_id: userId,
          token,
          expires_at,
        },
      });

    return [
      undefined,
      EmailVerificationTokenEntity.fromObject(emailVerificationToken),
    ];
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

    console.log({ emailVerificationToken });

    return [
      undefined,
      emailVerificationToken
        ? EmailVerificationTokenEntity.fromObject(emailVerificationToken)
        : null,
    ];
  }

  async updateEmailVerificationTokenVerifiedDate(
    tokenId: EmailVerificationTokenEntity['id']
  ): Promise<[Exception | undefined, string | null]> {
    await this.prismadb.emailVerificationToken.update({
      where: {
        id: tokenId,
      },
      data: {
        verified_at: new Date(),
      },
    });
    return [undefined, 'Email verification token used'];
  }

  async deleteUserEmailVerificationTokens(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, string | null]> {
    await this.prismadb.emailVerificationToken.deleteMany({
      where: {
        user_id: userId,
      },
    });
    return [undefined, 'Email verification tokens deleted'];
  }

  async createPasswordResetToken(
    userId: UserWithoutPassword['id'],
    token: string,
    expires_at: Date
  ): Promise<[Exception | undefined, PasswordResetTokenEntity | null]> {
    const passwordResetToken = await this.prismadb.passwordResetToken.create({
      data: {
        user_id: userId,
        token,
        expires_at: expires_at,
      },
    });
    return [undefined, PasswordResetTokenEntity.fromObject(passwordResetToken)];
  }

  async findPasswordResetToken(
    token: string
  ): Promise<[Exception | undefined, PasswordResetTokenEntity | null]> {
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

  async updatePasswordResetTokenUsedDate(
    tokenId: PasswordResetTokenEntity['id']
  ): Promise<[Exception | undefined, string | null]> {
    await this.prismadb.passwordResetToken.update({
      where: {
        id: tokenId,
      },
      data: {
        used_at: new Date(),
      },
    });
    return [undefined, 'Password reset token used'];
  }

  async deleteUserPasswordResetTokens(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, string | null]> {
    await this.prismadb.passwordResetToken.deleteMany({
      where: {
        user_id: userId,
      },
    });

    return [undefined, 'Password reset tokens deleted'];
  }

  async updatePassword(
    userId: string,
    hashedPassword: string
  ): Promise<[Exception | undefined, string | null]> {
    await this.prismadb.user.update({
      where: {
        id: userId,
      },
      data: {
        password_hash: hashedPassword,
      },
    });
    return [undefined, 'Password updated'];
  }
}
