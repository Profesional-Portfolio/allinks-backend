import {
  CreateLinkDto,
  ReorderLinksDto,
  IdDto,
  UpdateLinkDto,
  UserIdDto,
} from '@/domain/dtos';
import { LinkEntity } from '@/domain/entities';
import { Exception } from '@/domain/exceptions';

export interface LinksRepository {
  createLink(
    payload: CreateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]>;
  changeVisibility(
    payload: IdDto & UserIdDto
  ): Promise<[Exception | undefined, string]>;
  getLinks(
    userIdDto: UserIdDto
  ): Promise<[Exception | undefined, LinkEntity[]]>;
  getLinkById(
    payload: IdDto
  ): Promise<[Exception | undefined, LinkEntity | null]>;
  updateLink(
    payload: UpdateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]>;
  reorderLinks(
    payload: ReorderLinksDto
  ): Promise<[Exception | undefined, string]>;
}
