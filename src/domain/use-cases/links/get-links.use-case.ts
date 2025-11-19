import { UserIdDto } from '@/domain/dtos';
import { LinkEntity } from '@/domain/entities';
import { Exception } from '@/domain/exceptions';
import { LinksRepository } from '@/domain/repositories';

export interface IGetLinksUseCase {
  execute(userIdDto: UserIdDto): Promise<[Exception | undefined, LinkEntity[]]>;
}

export class GetLinksUseCase implements IGetLinksUseCase {
  constructor(private readonly linkRepository: LinksRepository) {}

  async execute(
    userIdDto: UserIdDto
  ): Promise<[Exception | undefined, LinkEntity[]]> {
    return await this.linkRepository.getLinks(userIdDto);
  }
}
