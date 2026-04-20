import { LinksDataSource } from '@/domain/datasources';
import {
  CreateLinkDto,
  IdDto,
  ReorderLinksDto,
  UpdateLinkDto,
  UserIdDto,
} from '@/domain/dtos';
import { LinkEntity } from '@/domain/entities';
import { Exception } from '@/domain/exceptions';
import { LinksRepository } from '@/domain/repositories';

export class LinksRepositoryImpl implements LinksRepository {
  constructor(private readonly linkDataSource: LinksDataSource) {}

  async changeVisibility(
    payload: IdDto & UserIdDto
  ): Promise<[Exception | undefined, string]> {
    return await this.linkDataSource.changeVisibility(payload);
  }

  async createLink(
    payload: CreateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]> {
    return await this.linkDataSource.createLink(payload);
  }

  async getLinkById(
    payload: IdDto & UserIdDto
  ): Promise<[Exception | undefined, LinkEntity | null]> {
    return await this.linkDataSource.getLinkById(payload);
  }

  async getLinks(
    userIdDto: UserIdDto
  ): Promise<[Exception | undefined, LinkEntity[]]> {
    return await this.linkDataSource.getLinks(userIdDto);
  }

  async getLinksByIds(
    payload: UserIdDto & { ids: string[] }
  ): Promise<[Exception | undefined, LinkEntity[]]> {
    return await this.linkDataSource.getLinksByIds(payload);
  }

  async reorderLinks(
    payload: ReorderLinksDto
  ): Promise<[Exception | undefined, string]> {
    return await this.linkDataSource.reorderLinks(payload);
  }

  async updateLink(
    payload: UpdateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]> {
    return await this.linkDataSource.updateLink(payload);
  }
}
