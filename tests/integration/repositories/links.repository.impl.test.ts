import { LinksRepositoryImpl } from '@/infraestructure/repositories/links.repository.impl';
import { LinksDataSource } from '@/domain/datasources';
import { CreateLinkDto, ReorderLinksDto } from '@/domain/dtos';
import { Platforms } from '@/domain/enums';

describe('LinksRepositoryImpl', () => {
  let linksRepository: LinksRepositoryImpl;
  let mockDataSource: jest.Mocked<LinksDataSource>;

  beforeEach(() => {
    mockDataSource = {
      createLink: jest.fn(),
      getLinks: jest.fn(),
      getLinksByIds: jest.fn(),
      getLinkById: jest.fn(),
      updateLink: jest.fn(),
      changeVisibility: jest.fn(),
      reorderLinks: jest.fn(),
    };
    linksRepository = new LinksRepositoryImpl(mockDataSource);
  });

  describe('getLinks', () => {
    it('should call getLinks on data source', async () => {
      mockDataSource.getLinks.mockResolvedValue([undefined, []]);
      await linksRepository.getLinks({ user_id: 'user-123' });
      expect(mockDataSource.getLinks).toHaveBeenCalledWith({ user_id: 'user-123' });
    });
  });

  describe('getLinksByIds', () => {
    it('should call getLinksByIds on data source', async () => {
      const payload = { user_id: 'user-123', ids: ['link-1'] };
      mockDataSource.getLinksByIds.mockResolvedValue([undefined, []]);
      await linksRepository.getLinksByIds(payload);
      expect(mockDataSource.getLinksByIds).toHaveBeenCalledWith(payload);
    });
  });

  describe('createLink', () => {
    it('should call createLink on data source', async () => {
      const payload: CreateLinkDto = { user_id: 'user-1', url: 'http://test.com', title: 'Test', platform: Platforms.YOUTUBE, is_active: true };
      mockDataSource.createLink.mockResolvedValue([undefined, null]);
      await linksRepository.createLink(payload);
      expect(mockDataSource.createLink).toHaveBeenCalledWith(payload);
    });
  });

  describe('changeVisibility', () => {
    it('should call changeVisibility on data source', async () => {
      const payload = { id: 'link-1', user_id: 'user-123' };
      mockDataSource.changeVisibility.mockResolvedValue([undefined, 'Link updated']);
      await linksRepository.changeVisibility(payload);
      expect(mockDataSource.changeVisibility).toHaveBeenCalledWith(payload);
    });
  });

  describe('getLinkById', () => {
    it('should call getLinkById on data source', async () => {
      const payload = { id: 'link-1', user_id: 'user-123' };
      mockDataSource.getLinkById.mockResolvedValue([undefined, null]);
      await linksRepository.getLinkById(payload);
      expect(mockDataSource.getLinkById).toHaveBeenCalledWith(payload);
    });
  });

  describe('updateLink', () => {
    it('should call updateLink on data source', async () => {
      const payload = { id: 'link-1', user_id: 'user-123', title: 'New title' };
      mockDataSource.updateLink.mockResolvedValue([undefined, null]);
      await linksRepository.updateLink(payload);
      expect(mockDataSource.updateLink).toHaveBeenCalledWith(payload);
    });
  });

  describe('reorderLinks', () => {
    it('should call reorderLinks on data source', async () => {
      const payload: ReorderLinksDto = { user_id: 'user-123', links: [{ id: 'link-1', display_order: 1 }] };
      mockDataSource.reorderLinks.mockResolvedValue([undefined, 'Links reordered']);
      await linksRepository.reorderLinks(payload);
      expect(mockDataSource.reorderLinks).toHaveBeenCalledWith(payload);
    });
  });
});
