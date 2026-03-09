import { jest } from '@jest/globals';
import { UsersRepository } from '@/domain/repositories';

export const mockUsersRepository = {
  findUserWithLinksByUsername: jest.fn(),
  findUserByUsername: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  checkUsernameAvailability: jest.fn(),
  updateProfileUser: jest.fn(),
  updateAvatarUser: jest.fn(),
  deleteAvatarUser: jest.fn(),
} as jest.Mocked<UsersRepository>;
