import { LoginUserDto, RegisterUserDto } from '../dtos/auth';
import {
  EmailVerificationTokenEntity,
  PasswordResetTokenEntity,
  UserWithoutPassword,
} from '../entities';
import { Exception } from '../exceptions';

export abstract class AuthDatasource {
  abstract register(
    payload: RegisterUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword | null]>;
  abstract findUserByEmail(
    email: string
  ): Promise<[Exception | undefined, UserWithoutPassword | null]>;
  abstract findUserById(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, UserWithoutPassword | null]>;
  abstract login(
    payload: LoginUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword | null]>;
  abstract updateLastLogin(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, string | undefined]>;

  abstract updateEmailVerified(
    userId: UserWithoutPassword['id'],
    verified: boolean
  ): Promise<[Exception | undefined, string]>;
  abstract createEmailVerificationToken(
    userId: UserWithoutPassword['id'],
    token: string,
    expires_at: Date
  ): Promise<[Exception | undefined, EmailVerificationTokenEntity | null]>;
  abstract findEmailVerificationToken(
    token: string
  ): Promise<[Exception | undefined, EmailVerificationTokenEntity | null]>;
  abstract deleteUserEmailVerificationTokens(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, string | null]>;

  // Nuevos métodos para reset de password
  abstract createPasswordResetToken(
    userId: UserWithoutPassword['id'],
    token: string,
    expires_at: Date
  ): Promise<[Exception | undefined, PasswordResetTokenEntity | null]>;
  abstract findPasswordResetToken(
    token: string
  ): Promise<[Exception | undefined, PasswordResetTokenEntity | null]>;
  abstract updatePasswordResetTokenUsedDate(
    tokenId: PasswordResetTokenEntity['id']
  ): Promise<[Exception | undefined, string | null]>;
  abstract updateEmailVerificationTokenVerifiedDate(
    tokenId: EmailVerificationTokenEntity['id']
  ): Promise<[Exception | undefined, string | null]>;
  abstract deleteUserPasswordResetTokens(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, string | null]>;
  abstract updatePassword(
    userId: string,
    hashedPassword: string
  ): Promise<[Exception | undefined, string | null]>;
}
