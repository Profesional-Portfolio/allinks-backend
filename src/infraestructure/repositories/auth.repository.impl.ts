import { Exception } from '@/domain/exceptions';
import {
  AuthRepository,
  AuthDatasource,
  LoginUserDto,
  RegisterUserDto,
  UserWithoutPassword,
  EmailVerificationTokenEntity,
  PasswordResetTokenEntity,
} from '@/domain/index';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly authDatasource: AuthDatasource) {}

  register(
    registerUserDto: RegisterUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
    return this.authDatasource.register(registerUserDto);
  }

  findUserByEmail(
    email: string
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
    return this.authDatasource.findUserByEmail(email);
  }

  findUserById(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
    return this.authDatasource.findUserById(id);
  }

  updateLastLogin(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, string | undefined]> {
    return this.authDatasource.updateLastLogin(userId);
  }

  login(
    loginUserDto: LoginUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword | null]> {
    return this.authDatasource.login(loginUserDto);
  }

  updateEmailVerified(
    userId: UserWithoutPassword['id'],
    verified: boolean
  ): Promise<[Exception | undefined, string]> {
    return this.authDatasource.updateEmailVerified(userId, verified);
  }

  updatePassword(
    userId: string,
    hashedPassword: string
  ): Promise<[Exception | undefined, string | null]> {
    return this.authDatasource.updatePassword(userId, hashedPassword);
  }

  createEmailVerificationToken(
    userId: UserWithoutPassword['id'],
    token: string,
    expires_at: Date
  ): Promise<[Exception | undefined, EmailVerificationTokenEntity | null]> {
    return this.authDatasource.createEmailVerificationToken(
      userId,
      token,
      expires_at
    );
  }

  createPasswordResetToken(
    userId: UserWithoutPassword['id'],
    token: string,
    expires_at: Date
  ): Promise<[Exception | undefined, PasswordResetTokenEntity | null]> {
    return this.authDatasource.createPasswordResetToken(
      userId,
      token,
      expires_at
    );
  }

  findEmailVerificationToken(
    token: string
  ): Promise<[Exception | undefined, EmailVerificationTokenEntity | null]> {
    return this.authDatasource.findEmailVerificationToken(token);
  }

  deleteUserEmailVerificationTokens(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, string | null]> {
    return this.authDatasource.deleteUserEmailVerificationTokens(userId);
  }

  deleteUserPasswordResetTokens(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, string | null]> {
    return this.authDatasource.deleteUserPasswordResetTokens(userId);
  }

  findPasswordResetToken(
    token: string
  ): Promise<[Exception | undefined, PasswordResetTokenEntity | null]> {
    return this.authDatasource.findPasswordResetToken(token);
  }

  updateEmailVerificationTokenVerifiedDate(
    tokenId: EmailVerificationTokenEntity['id']
  ): Promise<[Exception | undefined, string | null]> {
    return this.authDatasource.updateEmailVerificationTokenVerifiedDate(
      tokenId
    );
  }

  updatePasswordResetTokenUsedDate(
    tokenId: PasswordResetTokenEntity['id']
  ): Promise<[Exception | undefined, string | null]> {
    return this.authDatasource.updatePasswordResetTokenUsedDate(tokenId);
  }
}
