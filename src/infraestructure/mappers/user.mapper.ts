import { UserEntity } from '@/domain/entities';

export class UserMapper {
  static toEntity(
    object: UserEntity,
    excludePassword = false
  ): UserEntity | Omit<UserEntity, 'password_hash'> {
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
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    return user;
  }
}
