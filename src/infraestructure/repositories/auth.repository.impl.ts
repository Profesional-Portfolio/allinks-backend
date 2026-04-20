import { Exception } from '@/domain/exceptions';
import {
  AuthDatasource,
  AuthRepository,
  EmailVerificationTokenEntity,
  LoginUserDto,
  PasswordResetTokenEntity,
  RegisterUserDto,
  UserWithoutPassword,
} from '@/domain/index';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly authDatasource: AuthDatasource) {}

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
  ): Promise<[Exception | undefined, null | PasswordResetTokenEntity]> {
    return this.authDatasource.createPasswordResetToken(
      userId,
      token,
      expires_at
    );
  }

  deleteUserEmailVerificationTokens(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, null | string]> {
    return this.authDatasource.deleteUserEmailVerificationTokens(userId);
  }

  deleteUserPasswordResetTokens(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, null | string]> {
    return this.authDatasource.deleteUserPasswordResetTokens(userId);
  }

  findEmailVerificationToken(
    token: string
  ): Promise<[Exception | undefined, EmailVerificationTokenEntity | null]> {
    return this.authDatasource.findEmailVerificationToken(token);
  }

  findPasswordResetToken(
    token: string
  ): Promise<[Exception | undefined, null | PasswordResetTokenEntity]> {
    return this.authDatasource.findPasswordResetToken(token);
  }

  findUserByEmail(
    email: string
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    return this.authDatasource.findUserByEmail(email);
  }

  findUserById(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    return this.authDatasource.findUserById(id);
  }

  login(
    loginUserDto: LoginUserDto
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    return this.authDatasource.login(loginUserDto);
  }

  register(
    registerUserDto: RegisterUserDto
  ): Promise<[Exception | undefined, null | UserWithoutPassword]> {
    return this.authDatasource.register(registerUserDto);
  }

  updateEmailVerificationTokenVerifiedDate(
    tokenId: EmailVerificationTokenEntity['id']
  ): Promise<[Exception | undefined, null | string]> {
    return this.authDatasource.updateEmailVerificationTokenVerifiedDate(
      tokenId
    );
  }

  updateEmailVerified(
    userId: UserWithoutPassword['id'],
    verified: boolean
  ): Promise<[Exception | undefined, string]> {
    return this.authDatasource.updateEmailVerified(userId, verified);
  }

  updateLastLogin(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, string | undefined]> {
    return this.authDatasource.updateLastLogin(userId);
  }

  updatePassword(
    userId: string,
    hashedPassword: string
  ): Promise<[Exception | undefined, null | string]> {
    return this.authDatasource.updatePassword(userId, hashedPassword);
  }

  updatePasswordResetTokenUsedDate(
    tokenId: PasswordResetTokenEntity['id']
  ): Promise<[Exception | undefined, null | string]> {
    return this.authDatasource.updatePasswordResetTokenUsedDate(tokenId);
  }
}
