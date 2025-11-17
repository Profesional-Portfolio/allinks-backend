import { UserEntity } from '@/domain/entities';

export class UserMapper {
  static userEntityFromObject(
    object: UserEntity,
    excludePassword = false
  ): UserEntity {
    const user = new UserEntity(
      object.id,
      object.email,
      object.username,
      object.first_name,
      object.last_name,
      object.bio,
      object.avatar_url,
      object.is_active,
      object.email_verified,
      object.password_hash,
      object.created_at,
      object.updated_at,
      object.last_login_at
    );

    if (excludePassword) {
      user.password_hash = '';
    }

    return user;
  }
}
