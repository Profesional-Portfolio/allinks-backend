import { LinkEntity } from '@/domain/entities';
import { UpdateLinkDto } from '@/domain/dtos';
import { LinksRepository } from '@/domain/repositories';
import { Exception } from '@/domain/exceptions';

interface IUpdateLinkUseCase {
  execute(
    payload: UpdateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]>;
}

export class UpdateLinkUseCase implements IUpdateLinkUseCase {
  constructor(private readonly linkRepository: LinksRepository) {}

  async execute(
    payload: UpdateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]> {
    return await this.linkRepository.updateLink(payload);
  }
}
