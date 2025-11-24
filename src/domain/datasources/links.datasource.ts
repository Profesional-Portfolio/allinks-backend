import {
  CreateLinkDto,
  UpdateLinkDto,
  ReorderLinksDto,
  IdDto,
  UserIdDto,
} from '@/domain/dtos';
import { LinkEntity } from '@/domain/entities';
import { Exception } from '@/domain/exceptions';

export interface LinksDataSource {
  createLink(
    payload: CreateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]>;
  changeVisibility(
    payload: IdDto & UserIdDto
  ): Promise<[Exception | undefined, string]>;
  getLinks(
    userIdDto: UserIdDto
  ): Promise<[Exception | undefined, LinkEntity[]]>;

  getLinksByIds(
    payload: UserIdDto & { ids: string[] }
  ): Promise<[Exception | undefined, LinkEntity[]]>;
  getLinkById(
    payload: UserIdDto & IdDto
  ): Promise<[Exception | undefined, LinkEntity | null]>;

  updateLink(
    payload: UpdateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]>;
  reorderLinks(
    payload: ReorderLinksDto
  ): Promise<[Exception | undefined, string]>;
}
