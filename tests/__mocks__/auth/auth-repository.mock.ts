import { jest } from '@jest/globals';
import { PasswordHasher, TokenProvider } from '@/domain/interfaces';
import { AuthRepository } from '@/domain/repositories';

export const mockAuthRepository = {
  login: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  updateLastLogin: jest.fn(),
  register: jest.fn(),
  generateTokenPair: jest.fn(),
  createEmailVerificationToken: jest.fn(),
  verifyEmailVerificationToken: jest.fn(),
  updateEmailVerificationToken: jest.fn(),
  deleteEmailVerificationToken: jest.fn(),
  findEmailVerificationToken: jest.fn(),
  findUserByEmailVerificationToken: jest.fn(),
  findUserByEmailVerificationTokenByToken: jest.fn(),
  createPasswordResetToken: jest.fn(),
  deleteUserEmailVerificationTokens: jest.fn(),
  deleteUserPasswordResetTokens: jest.fn(),
  findPasswordResetToken: jest.fn(),
  updateEmailVerificationTokenVerifiedDate: jest.fn(),
  updatePasswordResetTokenUsedDate: jest.fn(),
  updateEmailVerified: jest.fn(),
  updatePassword: jest.fn(),
} as jest.Mocked<AuthRepository>;

export const mockPasswordHasher = {
  hash: jest.fn(),
  compare: jest.fn(),
} as jest.Mocked<PasswordHasher>;

export const mockTokenProvider = {
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  generateTokenPair: jest.fn(),
} as jest.Mocked<TokenProvider>;
