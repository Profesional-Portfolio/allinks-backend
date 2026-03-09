import { jest } from '@jest/globals';
import { CacheService } from '@/infraestructure/services/cache.service';

export const mockCacheService: jest.Mocked<CacheService> = {
  setSession: jest.fn(),
  getSession: jest.fn(),
  setRefreshToken: jest.fn(),
  getRefreshToken: jest.fn(),
  deleteRefreshToken: jest.fn(),
  setPublicProfile: jest.fn(),
  getPublicProfile: jest.fn(),
  setUserProfile: jest.fn(),
  getUserProfile: jest.fn(),
  setUserLinks: jest.fn(),
  getUserLinks: jest.fn(),
  getRateLimit: jest.fn(),
  setRateLimit: jest.fn(),
  setPlatformsConfig: jest.fn(),
  getPlatformsConfig: jest.fn(),
  invalidateProfile: jest.fn(),
  invalidateLinks: jest.fn(),
  invalidateUsernameChange: jest.fn(),
  invalidateUserDeletion: jest.fn(),
} as unknown as jest.Mocked<CacheService>;
