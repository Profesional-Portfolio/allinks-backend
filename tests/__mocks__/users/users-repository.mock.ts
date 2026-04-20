import { jest } from '@jest/globals';

import { UsersRepository } from '@/domain/repositories';

export const mockUsersRepository = {
  checkUsernameAvailability: jest.fn(),
  deleteAvatarUser: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  findUserByUsername: jest.fn(),
  findUserWithLinksByUsername: jest.fn(),
  updateAvatarUser: jest.fn(),
  updateProfileUser: jest.fn(),
} as jest.Mocked<UsersRepository>;
