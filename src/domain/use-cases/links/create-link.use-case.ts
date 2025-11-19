import { LinkEntity } from '@/domain/entities';
import { CreateLinkDto } from '@/domain/dtos';
import { LinksRepository } from '@/domain/repositories';
import { Exception } from '@/domain/exceptions';

interface ICreateLinkUseCase {
  execute(
    payload: CreateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]>;
}

export class CreateLinkUseCase implements ICreateLinkUseCase {
  constructor(private readonly linkRepository: LinksRepository) {}

  async execute(
    payload: CreateLinkDto
  ): Promise<[Exception | undefined, LinkEntity | null]> {
    return await this.linkRepository.createLink(payload);
  }
}
