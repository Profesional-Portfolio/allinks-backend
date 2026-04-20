import { LinkEntity } from '@/domain/entities';

export const LinkMapper = {
  toEntity(link: LinkEntity): LinkEntity {
    return new LinkEntity(
      link.id,
      link.user_id,
      link.platform,
      link.url,
      link.title,
      link.display_order,
      link.is_active,
      link.created_at,
      link.updated_at
    );
  },
};
