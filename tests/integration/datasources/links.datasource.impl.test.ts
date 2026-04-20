/* eslint-disable @typescript-eslint/unbound-method */
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { Platforms } from '@/domain/enums';
import { BadRequestException } from '@/domain/exceptions';
import { LinksDataSourceImpl } from '@/infraestructure/datasources/links.datasource.impl';
import { PrismaClient } from '@/prisma/client';

describe('LinksDataSourceImpl', () => {
  let linksDataSource: LinksDataSourceImpl;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    linksDataSource = new LinksDataSourceImpl(prismaMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLink', () => {
    const payload = {
      is_active: true,
      platform: Platforms.GITHUB,
      title: 'My GitHub',
      url: 'https://github.com/davejs',
      user_id: 'user-123',
    };

    it('should create link successfully', async () => {
      prismaMock.link.count.mockResolvedValue(0);
      prismaMock.link.aggregate.mockResolvedValue({
        _avg: null,
        _count: null,
        _max: { display_order: null },
        _min: null,
        _sum: null,
      } as any);
      prismaMock.platform.findUnique.mockResolvedValue({
        name: 'GitHub',
        url_pattern: '.*',
      } as any);

      const createdLink = {
        id: 'link-1',
        ...payload,
        created_at: new Date(),
        display_order: 1,
        updated_at: new Date(),
      };
      prismaMock.link.create.mockResolvedValue(createdLink as any);

      const [error, result] = await linksDataSource.createLink(payload);

      expect(error).toBeUndefined();
      expect(result).toBeDefined();
      expect(result?.url).toBe(payload.url);
      expect(prismaMock.link.create).toHaveBeenCalled();
    });

    it('should return error if limit reached', async () => {
      prismaMock.link.count.mockResolvedValue(20);

      const [error] = await linksDataSource.createLink(payload);

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error?.message).toBe(
        'You have reached the maximum number of links'
      );
    });

    it('should return error if URL is invalid for platform', async () => {
      prismaMock.link.count.mockResolvedValue(0);
      prismaMock.link.aggregate.mockResolvedValue({
        _max: { display_order: null },
      } as any);
      prismaMock.platform.findUnique.mockResolvedValue({
        name: 'GitHub',
        url_pattern: '^nevermatch$',
      } as any);

      const invalidPayload = {
        ...payload,
        url: 'https://notgithub.com/davejs',
      };

      const [error] = await linksDataSource.createLink(invalidPayload);

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error?.message).toBe('Invalid URL');
    });
  });

  describe('getLinks', () => {
    it('should get links successfully', async () => {
      const mockLinks = [
        {
          created_at: new Date(),
          display_order: 1,
          id: 'link-1',
          is_active: true,
          platform: 'Web',
          title: 'Test',
          updated_at: new Date(),
          url: 'test.com',
          user_id: '123',
        },
      ];
      prismaMock.link.findMany.mockResolvedValue(mockLinks as any);

      const [error, result] = await linksDataSource.getLinks({
        user_id: '123',
      });

      expect(error).toBeUndefined();
      if (result) {
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('link-1');
      }
      expect(prismaMock.link.findMany).toHaveBeenCalledWith({
        orderBy: { display_order: 'asc' },
        where: { user_id: '123' },
      });
    });
  });

  describe('updateLink', () => {
    it('should update link successfully', async () => {
      const dbLink = {
        created_at: new Date(),
        display_order: 1,
        id: 'link-1',
        is_active: true,
        platform: 'Web',
        title: 'Old',
        updated_at: new Date(),
        url: 'old.com',
        user_id: 'user-123',
      };
      prismaMock.link.findUnique.mockResolvedValue(dbLink as any);
      prismaMock.platform.findUnique.mockResolvedValue(null);

      const updatedDbLink = { ...dbLink, title: 'New Title' };
      prismaMock.link.update.mockResolvedValue(updatedDbLink as any);

      const [error, result] = await linksDataSource.updateLink({
        id: 'link-1',
        title: 'New Title',
        user_id: 'user-123',
      });

      expect(error).toBeUndefined();
      expect(result?.title).toBe('New Title');
      expect(prismaMock.link.update).toHaveBeenCalled();
    });
  });

  describe('changeVisibility', () => {
    it('should change visibility successfully', async () => {
      const dbLink = {
        created_at: new Date(),
        display_order: 1,
        id: 'link-1',
        is_active: true,
        platform: 'Web',
        title: 'Test',
        updated_at: new Date(),
        url: 'test.com',
        user_id: 'user-123',
      };
      prismaMock.link.findUnique.mockResolvedValue(dbLink as any);
      prismaMock.link.update.mockResolvedValue({
        ...dbLink,
        is_active: false,
      } as any);

      const [error, result] = await linksDataSource.changeVisibility({
        id: 'link-1',
        user_id: 'user-123',
      });

      expect(error).toBeUndefined();
      expect(result).toBe('Link updated');
      expect(prismaMock.link.update).toHaveBeenCalledWith({
        data: { is_active: false },
        where: { id: 'link-1', user_id: 'user-123' },
      });
    });
  });

  describe('reorderLinks', () => {
    it('should reorder links successfully', async () => {
      const dbLinks = [{ id: 'link-1' }, { id: 'link-2' }];
      prismaMock.link.findMany.mockResolvedValue(dbLinks as any);
      prismaMock.$transaction.mockResolvedValue({} as any);

      const payload = {
        links: [
          { display_order: 2, id: 'link-1' },
          { display_order: 1, id: 'link-2' },
        ],
        user_id: 'user-123',
      };

      const [error, result] = await linksDataSource.reorderLinks(payload);

      expect(error).toBeUndefined();
      expect(result).toBe('Links reordered');
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });
});
