import { jest } from '@jest/globals';

import { PasswordHasher, TokenProvider } from '@/domain/interfaces';
import { AuthRepository } from '@/domain/repositories';

export const mockAuthRepository = {
  createEmailVerificationToken: jest.fn(),
  createPasswordResetToken: jest.fn(),
  deleteEmailVerificationToken: jest.fn(),
  deleteUserEmailVerificationTokens: jest.fn(),
  deleteUserPasswordResetTokens: jest.fn(),
  findEmailVerificationToken: jest.fn(),
  findPasswordResetToken: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserByEmailVerificationToken: jest.fn(),
  findUserByEmailVerificationTokenByToken: jest.fn(),
  findUserById: jest.fn(),
  generateTokenPair: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
  updateEmailVerificationToken: jest.fn(),
  updateEmailVerificationTokenVerifiedDate: jest.fn(),
  updateEmailVerified: jest.fn(),
  updateLastLogin: jest.fn(),
  updatePassword: jest.fn(),
  updatePasswordResetTokenUsedDate: jest.fn(),
  verifyEmailVerificationToken: jest.fn(),
} as jest.Mocked<AuthRepository>;

export const mockPasswordHasher = {
  compare: jest.fn(),
  hash: jest.fn(),
} as jest.Mocked<PasswordHasher>;

export const mockTokenProvider = {
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  generateTokenPair: jest.fn(),
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
} as jest.Mocked<TokenProvider>;
