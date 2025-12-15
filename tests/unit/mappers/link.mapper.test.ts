import { LinkEntity } from '../../../src/domain/entities';
import { LinkMapper } from '../../../src/infraestructure/mappers/link.mapper';

describe('LinkMapper', () => {
  const mockLinkData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: '987e6543-e21b-12d3-a456-426614174999',
    platform: 'github',
    url: 'https://github.com/testuser',
    title: 'My GitHub Profile',
    display_order: 1,
    is_active: true,
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-02T00:00:00.000Z'),
  };

  describe('toEntity', () => {
    it('should create a LinkEntity from object with all properties', () => {
      const result = LinkMapper.toEntity(mockLinkData);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockLinkData.id);
      expect(result.user_id).toBe(mockLinkData.user_id);
      expect(result.platform).toBe(mockLinkData.platform);
      expect(result.url).toBe(mockLinkData.url);
      expect(result.title).toBe(mockLinkData.title);
      expect(result.display_order).toBe(mockLinkData.display_order);
      expect(result.is_active).toBe(mockLinkData.is_active);
      expect(result.created_at).toEqual(mockLinkData.created_at);
      expect(result.updated_at).toEqual(mockLinkData.updated_at);
    });

    it('should map all properties correctly', () => {
      const result = LinkMapper.toEntity(mockLinkData);

      // Verify all properties exist
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('user_id');
      expect(result).toHaveProperty('platform');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('display_order');
      expect(result).toHaveProperty('is_active');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_at');
    });

    it('should handle inactive links', () => {
      const inactiveLinkData = {
        ...mockLinkData,
        is_active: false,
      };

      const result = LinkMapper.toEntity(inactiveLinkData);

      expect(result.is_active).toBe(false);
      expect(result.id).toBe(mockLinkData.id);
      expect(result.url).toBe(mockLinkData.url);
    });

    it('should handle different platforms', () => {
      const platforms = [
        'twitter',
        'linkedin',
        'instagram',
        'youtube',
        'website',
      ];

      platforms.forEach(platform => {
        const linkData = {
          ...mockLinkData,
          platform,
        };

        const result = LinkMapper.toEntity(linkData);

        expect(result.platform).toBe(platform);
      });
    });

    it('should handle different display orders', () => {
      const displayOrders = [0, 1, 5, 10, 100];

      displayOrders.forEach(order => {
        const linkData = {
          ...mockLinkData,
          display_order: order,
        };

        const result = LinkMapper.toEntity(linkData);

        expect(result.display_order).toBe(order);
      });
    });

    it('should preserve Date objects for timestamps', () => {
      const now = new Date();
      const linkData = {
        ...mockLinkData,
        created_at: now,
        updated_at: now,
      };

      const result = LinkMapper.toEntity(linkData);

      expect(result.created_at).toEqual(now);
      expect(result.updated_at).toEqual(now);
    });

    it('should handle different URL formats', () => {
      const urls = [
        'https://github.com/user',
        'https://twitter.com/user',
        'https://linkedin.com/in/user',
        'https://example.com',
        'http://example.com',
      ];

      urls.forEach(url => {
        const linkData = {
          ...mockLinkData,
          url,
        };

        const result = LinkMapper.toEntity(linkData);

        expect(result.url).toBe(url);
      });
    });

    it('should handle different title lengths', () => {
      const titles = [
        'A',
        'Short Title',
        'A Very Long Title That Contains Many Characters',
        'Title with special chars: @#$%',
      ];

      titles.forEach(title => {
        const linkData = {
          ...mockLinkData,
          title,
        };

        const result = LinkMapper.toEntity(linkData);

        expect(result.title).toBe(title);
      });
    });

    it('should handle different user IDs', () => {
      const userIds = [
        '123e4567-e89b-12d3-a456-426614174000',
        '987e6543-e21b-12d3-a456-426614174999',
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      ];

      userIds.forEach(user_id => {
        const linkData = {
          ...mockLinkData,
          user_id,
        };

        const result = LinkMapper.toEntity(linkData);

        expect(result.user_id).toBe(user_id);
      });
    });

    it('should create a new object, not return the same reference', () => {
      const result = LinkMapper.toEntity(mockLinkData);

      expect(result).not.toBe(mockLinkData);
      expect(result).toEqual(mockLinkData);
    });

    it('should handle complete link data from database', () => {
      const dbLinkData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '660e8400-e29b-41d4-a716-446655440001',
        platform: 'linkedin',
        url: 'https://linkedin.com/in/johndoe',
        title: 'Professional Profile',
        display_order: 3,
        is_active: true,
        created_at: new Date('2024-06-15T10:30:00.000Z'),
        updated_at: new Date('2024-06-20T14:45:00.000Z'),
      };

      const result = LinkMapper.toEntity(dbLinkData);

      expect(result.id).toBe(dbLinkData.id);
      expect(result.user_id).toBe(dbLinkData.user_id);
      expect(result.platform).toBe(dbLinkData.platform);
      expect(result.url).toBe(dbLinkData.url);
      expect(result.title).toBe(dbLinkData.title);
      expect(result.display_order).toBe(dbLinkData.display_order);
      expect(result.is_active).toBe(dbLinkData.is_active);
      expect(result.created_at).toEqual(dbLinkData.created_at);
      expect(result.updated_at).toEqual(dbLinkData.updated_at);
    });

    it('should handle extra properties in input object', () => {
      const linkDataWithExtra = {
        ...mockLinkData,
        extra_field: 'should be ignored',
        another_field: 123,
      };

      const result = LinkMapper.toEntity(linkDataWithExtra);

      expect(result.id).toBe(mockLinkData.id);
      expect(result.user_id).toBe(mockLinkData.user_id);
      expect(result.platform).toBe(mockLinkData.platform);
      // Extra fields should not be in the result
      expect(result).not.toHaveProperty('extra_field');
      expect(result).not.toHaveProperty('another_field');
    });

    it('should map multiple links correctly', () => {
      const links = [
        { ...mockLinkData, id: '1', display_order: 1 },
        { ...mockLinkData, id: '2', display_order: 2 },
        { ...mockLinkData, id: '3', display_order: 3 },
      ];

      const results = links.map(link => LinkMapper.toEntity(link));

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.id).toBe(links[index].id);
        expect(result.display_order).toBe(links[index].display_order);
      });
    });
  });
});
