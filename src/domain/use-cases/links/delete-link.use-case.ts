import { IdDto, UserIdDto } from '@/domain/dtos';
import { Exception } from '@/domain/exceptions';
import { LinksRepository } from '@/domain/repositories';

export interface IChangeVisibilityUseCase {
  execute(linkIdDto: UserIdDto): Promise<[Exception | undefined, string]>;
}

export class ChangeVisibilityUseCase implements IChangeVisibilityUseCase {
  constructor(private readonly linkRepository: LinksRepository) {}
  async execute(
    payload: IdDto & UserIdDto
  ): Promise<[Exception | undefined, string]> {
    return await this.linkRepository.changeVisibility(payload);
  }
}
