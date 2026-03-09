import { LinksDataSourceImpl } from '@/infraestructure/datasources/links.datasource.impl';
import { PrismaClient } from '@/generated/prisma/client';
import { BadRequestException } from '@/domain/exceptions';
import { Platforms } from '@/domain/enums';

describe('LinksDataSourceImpl', () => {
  let linksDataSource: LinksDataSourceImpl;
  let prismaMock: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    prismaMock = {
      link: {
        count: jest.fn(),
        aggregate: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      platform: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    } as any;
    linksDataSource = new LinksDataSourceImpl(prismaMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLink', () => {
    const payload = {
      user_id: 'user-123',
      platform: Platforms.GITHUB,
      url: 'https://github.com/davejs',
      title: 'My GitHub',
      is_active: true,
    };


    it('should create link successfully', async () => {
      (prismaMock.link.count as jest.Mock).mockResolvedValue(0);
      (prismaMock.link.aggregate as jest.Mock).mockResolvedValue({ _max: { display_order: null } });
      (prismaMock.platform.findUnique as jest.Mock).mockResolvedValue({ name: 'GitHub', url_pattern: '.*' });
      
      const createdLink = {
        id: 'link-1',
        ...payload,
        display_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      };
      (prismaMock.link.create as jest.Mock).mockResolvedValue(createdLink);

      const [error, result] = await linksDataSource.createLink(payload);

      expect(error).toBeUndefined();
      expect(result).toBeDefined();
      expect(result?.url).toBe(payload.url);
      expect(prismaMock.link.create).toHaveBeenCalled();
    });

    it('should return error if limit reached', async () => {
      (prismaMock.link.count as jest.Mock).mockResolvedValue(20);

      const [error, result] = await linksDataSource.createLink(payload);

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error?.message).toBe('You have reached the maximum number of links');
    });

    it('should return error if URL is invalid for platform', async () => {
      (prismaMock.link.count as jest.Mock).mockResolvedValue(0);
      (prismaMock.link.aggregate as jest.Mock).mockResolvedValue({ _max: { display_order: null } });
      (prismaMock.platform.findUnique as jest.Mock).mockResolvedValue({ name: 'GitHub', url_pattern: '^nevermatch$' });

      const invalidPayload = { ...payload, url: 'https://notgithub.com/davejs' };

      const [error, result] = await linksDataSource.createLink(invalidPayload);

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error?.message).toBe('Invalid URL');
    });
  });

  describe('getLinks', () => {
    it('should get links successfully', async () => {
      const mockLinks = [
        { id: 'link-1', url: 'test.com', title: 'Test', platform: 'Web', is_active: true, display_order: 1, created_at: new Date(), updated_at: new Date(), user_id: '123' },
      ];
      (prismaMock.link.findMany as jest.Mock).mockResolvedValue(mockLinks);

      const [error, result] = await linksDataSource.getLinks({ user_id: '123' });

      expect(error).toBeUndefined();
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('link-1');
      expect(prismaMock.link.findMany).toHaveBeenCalledWith({
        where: { user_id: '123' },
        orderBy: { display_order: 'asc' },
      });
    });
  });

  describe('updateLink', () => {
    it('should update link successfully', async () => {
      const dbLink = { id: 'link-1', url: 'old.com', title: 'Old', platform: 'Web', is_active: true, display_order: 1, created_at: new Date(), updated_at: new Date(), user_id: 'user-123' };
      (prismaMock.link.findUnique as jest.Mock).mockResolvedValue(dbLink);
      (prismaMock.platform.findUnique as jest.Mock).mockResolvedValue(null);

      const updatedDbLink = { ...dbLink, title: 'New Title' };
      (prismaMock.link.update as jest.Mock).mockResolvedValue(updatedDbLink);

      const [error, result] = await linksDataSource.updateLink({ id: 'link-1', user_id: 'user-123', title: 'New Title' });

      expect(error).toBeUndefined();
      expect(result?.title).toBe('New Title');
      expect(prismaMock.link.update).toHaveBeenCalled();
    });
  });

  describe('changeVisibility', () => {
    it('should change visibility successfully', async () => {
      const dbLink = { id: 'link-1', url: 'test.com', title: 'Test', platform: 'Web', is_active: true, display_order: 1, created_at: new Date(), updated_at: new Date(), user_id: 'user-123' };
      (prismaMock.link.findUnique as jest.Mock).mockResolvedValue(dbLink);
      (prismaMock.link.update as jest.Mock).mockResolvedValue({ ...dbLink, is_active: false });

      const [error, result] = await linksDataSource.changeVisibility({ id: 'link-1', user_id: 'user-123' });

      expect(error).toBeUndefined();
      expect(result).toBe('Link updated');
      expect(prismaMock.link.update).toHaveBeenCalledWith({
        where: { id: 'link-1', user_id: 'user-123' },
        data: { is_active: false },
      });
    });
  });

  describe('reorderLinks', () => {
    it('should reorder links successfully', async () => {
      const dbLinks = [{ id: 'link-1' }, { id: 'link-2' }];
      (prismaMock.link.findMany as jest.Mock).mockResolvedValue(dbLinks);
      (prismaMock.$transaction as jest.Mock).mockResolvedValue({});

      const payload = {
        user_id: 'user-123',
        links: [
          { id: 'link-1', display_order: 2 },
          { id: 'link-2', display_order: 1 },
        ],
      };

      const [error, result] = await linksDataSource.reorderLinks(payload);

      expect(error).toBeUndefined();
      expect(result).toBe('Links reordered');
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });
});
