import { LoginUserDto, RegisterUserDto } from '../dtos/auth';
import {
  EmailVerificationTokenEntity,
  PasswordResetTokenEntity,
  UserWithoutPassword,
} from '../entities';
import { Exception } from '../exceptions';

export abstract class AuthDatasource {
  abstract createEmailVerificationToken(
    userId: UserWithoutPassword['id'],
    token: string,
    expires_at: Date
  ): Promise<[Exception | undefined, EmailVerificationTokenEntity | null]>;
  // Nuevos métodos para reset de password
  abstract createPasswordResetToken(
    userId: UserWithoutPassword['id'],
    token: string,
    expires_at: Date
  ): Promise<[Exception | undefined, null | PasswordResetTokenEntity]>;
  abstract deleteUserEmailVerificationTokens(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, null | string]>;
  abstract deleteUserPasswordResetTokens(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, null | string]>;
  abstract findEmailVerificationToken(
    token: string
  ): Promise<[Exception | undefined, EmailVerificationTokenEntity | null]>;

  abstract findPasswordResetToken(
    token: string
  ): Promise<[Exception | undefined, null | PasswordResetTokenEntity]>;
  abstract findUserByEmail(
    email: string
  ): Promise<[Exception | undefined, null | UserWithoutPassword]>;
  abstract findUserById(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, null | UserWithoutPassword]>;
  abstract login(
    payload: LoginUserDto
  ): Promise<[Exception | undefined, null | UserWithoutPassword]>;

  abstract register(
    payload: RegisterUserDto
  ): Promise<[Exception | undefined, null | UserWithoutPassword]>;
  abstract updateEmailVerificationTokenVerifiedDate(
    tokenId: EmailVerificationTokenEntity['id']
  ): Promise<[Exception | undefined, null | string]>;
  abstract updateEmailVerified(
    userId: UserWithoutPassword['id'],
    verified: boolean
  ): Promise<[Exception | undefined, string]>;
  abstract updateLastLogin(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, string | undefined]>;
  abstract updatePassword(
    userId: string,
    hashedPassword: string
  ): Promise<[Exception | undefined, null | string]>;
  abstract updatePasswordResetTokenUsedDate(
    tokenId: PasswordResetTokenEntity['id']
  ): Promise<[Exception | undefined, null | string]>;
}
