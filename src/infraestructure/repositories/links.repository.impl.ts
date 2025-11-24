import { LinksRepository } from '@/domain/repositories';
import { LinksDataSource } from '@/domain/datasources';
import { LinkEntity } from '@/domain/entities';
import {
  CreateLinkDto,
  IdDto,
  ReorderLinksDto,
  UpdateLinkDto,
  UserIdDto,
} from '@/domain/dtos';
import { Exception } from '@/domain/exceptions';

export class LinksRepositoryImpl implements LinksRepository {
  constructor(private readonly linkDataSource: LinksDataSource) {}

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

  async createLink(
    payload: CreateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]> {
    return await this.linkDataSource.createLink(payload);
  }

  async changeVisibility(
    payload: IdDto & UserIdDto
  ): Promise<[Exception | undefined, string]> {
    return await this.linkDataSource.changeVisibility(payload);
  }

  async getLinkById(
    payload: IdDto & UserIdDto
  ): Promise<[Exception | undefined, LinkEntity | null]> {
    return await this.linkDataSource.getLinkById(payload);
  }

  async updateLink(
    payload: UpdateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]> {
    return await this.linkDataSource.updateLink(payload);
  }

  async reorderLinks(
    payload: ReorderLinksDto
  ): Promise<[Exception | undefined, string]> {
    return await this.linkDataSource.reorderLinks(payload);
  }
}
