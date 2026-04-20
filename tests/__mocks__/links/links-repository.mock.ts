import { jest } from '@jest/globals';

import { LinksRepository } from '@/domain/repositories';

export const mockLinksRepository = {
  changeVisibility: jest.fn(),
  createLink: jest.fn(),
  getLinkById: jest.fn(),
  getLinks: jest.fn(),
  getLinksByIds: jest.fn(),
  reorderLinks: jest.fn(),
  updateLink: jest.fn(),
} as jest.Mocked<LinksRepository>;
