import { ReorderLinksDto } from '@/domain/dtos';
import { Exception } from '@/domain/exceptions';
import { LinksRepository } from '@/domain/repositories';

export interface IReorderLinksUseCase {
  execute(payload: ReorderLinksDto): Promise<[Exception | undefined, string]>;
}

export class ReorderLinksUseCase implements IReorderLinksUseCase {
  constructor(private readonly linkRepository: LinksRepository) {}
  async execute(
    payload: ReorderLinksDto
  ): Promise<[Exception | undefined, string]> {
    return await this.linkRepository.reorderLinks(payload);
  }
}
