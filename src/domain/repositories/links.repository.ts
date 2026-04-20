import {
  CreateLinkDto,
  IdDto,
  ReorderLinksDto,
  UpdateLinkDto,
  UserIdDto,
} from '@/domain/dtos';
import { LinkEntity } from '@/domain/entities';
import { Exception } from '@/domain/exceptions';

export interface LinksRepository {
  changeVisibility(
    payload: IdDto & UserIdDto
  ): Promise<[Exception | undefined, string]>;
  createLink(
    payload: CreateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]>;
  getLinkById(
    payload: IdDto
  ): Promise<[Exception | undefined, LinkEntity | null]>;

  getLinks(
    userIdDto: UserIdDto
  ): Promise<[Exception | undefined, LinkEntity[]]>;
  getLinksByIds(
    payload: UserIdDto & { ids: string[] }
  ): Promise<[Exception | undefined, LinkEntity[]]>;
  reorderLinks(
    payload: ReorderLinksDto
  ): Promise<[Exception | undefined, string]>;
  updateLink(
    payload: UpdateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]>;
}
