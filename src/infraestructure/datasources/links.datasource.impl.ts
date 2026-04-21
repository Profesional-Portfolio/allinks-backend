import { LinksDataSource } from '@/domain/datasources';
import {
  CreateLinkDto,
  IdDto,
  ReorderLinksDto,
  UpdateLinkDto,
  UserIdDto,
} from '@/domain/dtos';
import { LinkEntity } from '@/domain/entities';
import {
  BadRequestException,
  Exception,
  NotFoundException,
} from '@/domain/exceptions';
import { PrismaClient } from '@/prisma/client';

import { LinkMapper } from '../mappers';

export class LinksDataSourceImpl implements LinksDataSource {
  constructor(private readonly prismadb: PrismaClient) {}

  async changeVisibility(
    payload: IdDto & UserIdDto
  ): Promise<[Exception | undefined, string]> {
    try {
      const { id, user_id } = payload;

      const [exception, link] = await this.getLinkById({ id, user_id });

      if (exception || !link) {
        return [exception, ''];
      }

      await this.prismadb.link.update({
        data: {
          is_active: !link.is_active,
        },
        where: {
          id,
          user_id,
        },
      });

      return [undefined, 'Link updated'];
    } catch {
      const err = new Exception('Error deleting link', 500);
      return [err, ''];
    }
  }

  async createLink(
    payload: CreateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]> {
    try {
      const { platform, url, user_id } = payload;
      // verificar que la cuenta de links no supere los 20 links

      const linkCount = await this.prismadb.link.count({
        where: {
          user_id,
        },
      });

      if (linkCount >= 20) {
        return [
          new BadRequestException(
            'You have reached the maximum number of links'
          ),
          {} as LinkEntity,
        ];
      }

      // get next display order

      const maxOrder = await this.prismadb.link.aggregate({
        _max: {
          display_order: true,
        },
        where: {
          user_id,
        },
      });

      const nextOrder = maxOrder._max.display_order
        ? maxOrder._max.display_order + 1
        : 1;

      // validate url
      const platformData = await this.prismadb.platform.findUnique({
        where: {
          name: platform,
        },
      });

      if (platformData) {
        const regex = new RegExp(platformData.url_pattern, 'i');
        if (!regex.test(url)) {
          return [new BadRequestException('Invalid URL'), {} as LinkEntity];
        }
      }

      const linkCreated = await this.prismadb.link.create({
        data: {
          ...payload,
          display_order: nextOrder,
        },
      });

      const link = LinkMapper.toEntity(linkCreated);

      return [undefined, link];
    } catch {
      const err = new Exception('Error creating link', 500);
      return [err, null];
    }
  }

  async deleteLink(
    payload: IdDto & UserIdDto
  ): Promise<[Exception | undefined, string]> {
    try {
      const { id, user_id } = payload;
      await this.prismadb.link.delete({
        where: {
          id,
          user_id,
        },
      });

      return [undefined, 'Link deleted'];
    } catch {
      const err = new Exception('Error deleting link', 500);
      return [err, ''];
    }
  }

  async getLinkById(
    payload: IdDto & UserIdDto
  ): Promise<[Exception | undefined, LinkEntity | null]> {
    try {
      const { id, user_id } = payload;
      const link = await this.prismadb.link.findUnique({
        where: {
          id,
          user_id,
        },
      });

      if (!link) {
        return [new NotFoundException('Link not found'), null];
      }

      const linkMapped = LinkMapper.toEntity(link);

      return [undefined, linkMapped];
    } catch {
      const err = new Exception('Error getting link', 500);
      return [err, null];
    }
  }

  async getLinks(
    userIdDto: UserIdDto
  ): Promise<[Exception | undefined, LinkEntity[]]> {
    try {
      const { user_id } = userIdDto;
      const links = await this.prismadb.link.findMany({
        orderBy: {
          display_order: 'asc',
        },
        where: {
          user_id,
        },
      });

      const linksMapped = links.map(link => LinkMapper.toEntity(link));

      return [undefined, linksMapped];
    } catch {
      const err = new Exception('Error getting links', 500);
      return [err, [] as LinkEntity[]];
    }
  }

  async getLinksByIds(
    payload: UserIdDto & { ids: string[] }
  ): Promise<[Exception | undefined, LinkEntity[]]> {
    try {
      const { ids, user_id } = payload;
      const links = await this.prismadb.link.findMany({
        orderBy: {
          display_order: 'asc',
        },
        where: {
          id: {
            in: ids,
          },
          user_id,
        },
      });

      const linksMapped = links.map(link => LinkMapper.toEntity(link));

      return [undefined, linksMapped];
    } catch {
      const err = new Exception('Error getting links', 500);
      return [err, [] as LinkEntity[]];
    }
  }

  async reorderLinks(
    payload: ReorderLinksDto
  ): Promise<[Exception | undefined, string]> {
    try {
      const { links, user_id } = payload;

      const linkIds = links.map(link => link.id);

      const userLinks = await this.prismadb.link.findMany({
        select: {
          id: true,
        },
        where: {
          id: {
            in: linkIds,
          },
          user_id,
        },
      });

      if (userLinks.length !== linkIds.length) {
        return [new BadRequestException('Invalid links'), ''];
      }

      await this.prismadb.$transaction(
        links.map(link => {
          const { display_order, id } = link;
          return this.prismadb.link.update({
            data: {
              display_order,
            },
            where: {
              id,
            },
          });
        })
      );

      return [undefined, 'Links reordered'];
    } catch {
      const err = new Exception('Error reordering links', 500);
      return [err, ''];
    }
  }

  async updateLink(
    payload: UpdateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]> {
    try {
      const { id, is_active, platform, title, url, user_id } = payload;
      const [exception] = await this.getLinkById({ id, user_id });

      if (exception) {
        return [exception, null];
      }

      if (url && platform) {
        const platformData = await this.prismadb.platform.findUnique({
          where: {
            name: platform,
          },
        });

        if (platformData) {
          const regex = new RegExp(platformData.url_pattern, 'i');
          if (!regex.test(url)) {
            return [new BadRequestException('Invalid URL'), {} as LinkEntity];
          }
        }
      }

      const updatedLink = await this.prismadb.link.update({
        data: {
          is_active,
          platform,
          title,
          url,
        },
        where: {
          id,
          user_id,
        },
      });

      const updatedLinkMapped = LinkMapper.toEntity(updatedLink);

      return [undefined, updatedLinkMapped];
    } catch {
      const err = new Exception('Error updating link', 500);
      return [err, null];
    }
  }
}
