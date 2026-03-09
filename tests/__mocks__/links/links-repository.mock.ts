import { jest } from '@jest/globals';
import { LinksRepository } from '@/domain/repositories';

export const mockLinksRepository = {
  createLink: jest.fn(),
  changeVisibility: jest.fn(),
  getLinks: jest.fn(),
  getLinksByIds: jest.fn(),
  getLinkById: jest.fn(),
  updateLink: jest.fn(),
  reorderLinks: jest.fn(),
} as jest.Mocked<LinksRepository>;
