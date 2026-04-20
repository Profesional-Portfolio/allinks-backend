import { jest } from '@jest/globals';

import { CacheService } from '@/infraestructure/services/cache.service';

export const mockCacheService: jest.Mocked<CacheService> = {
  deleteRefreshToken: jest.fn(),
  getPlatformsConfig: jest.fn(),
  getPublicProfile: jest.fn(),
  getRateLimit: jest.fn(),
  getRefreshToken: jest.fn(),
  getSession: jest.fn(),
  getUserLinks: jest.fn(),
  getUserProfile: jest.fn(),
  invalidateLinks: jest.fn(),
  invalidateProfile: jest.fn(),
  invalidateUserDeletion: jest.fn(),
  invalidateUsernameChange: jest.fn(),
  setPlatformsConfig: jest.fn(),
  setPublicProfile: jest.fn(),
  setRateLimit: jest.fn(),
  setRefreshToken: jest.fn(),
  setSession: jest.fn(),
  setUserLinks: jest.fn(),
  setUserProfile: jest.fn(),
} as unknown as jest.Mocked<CacheService>;
