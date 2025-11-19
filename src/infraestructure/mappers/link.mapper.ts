import { LinkEntity } from '@/domain/entities';

export class LinkMapper {
  static toEntity(link: Record<string, any>): LinkEntity {
    return {
      id: link.id,
      user_id: link.user_id,
      platform: link.platform,
      url: link.url,
      title: link.title,
      display_order: link.display_order,
      is_active: link.is_active,
      created_at: link.created_at,
      updated_at: link.updated_at,
    };
  }
}
