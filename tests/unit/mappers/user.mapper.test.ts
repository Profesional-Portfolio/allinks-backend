import { UserEntity } from '../../../src/domain/entities';
import { UserMapper } from '../../../src/infraestructure/mappers/user.mapper';

describe('UserMapper', () => {
  const mockUserData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    username: 'testuser',
    first_name: 'John',
    last_name: 'Doe',
    bio: 'Test bio',
    avatar_url: 'https://example.com/avatar.jpg',
    is_active: true,
    email_verified: true,
    password_hash: 'hashedPassword123',
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-02T00:00:00.000Z'),
    last_login_at: new Date('2024-01-03T00:00:00.000Z'),
  };

  describe('toEntity', () => {
    it('should create a UserEntity from object with all properties', () => {
      const userEntity = new UserEntity(
        mockUserData.id,
        mockUserData.email,
        mockUserData.username,
        mockUserData.first_name,
        mockUserData.last_name,
        mockUserData.bio,
        mockUserData.avatar_url,
        mockUserData.is_active,
        mockUserData.email_verified,
        mockUserData.password_hash,
        mockUserData.created_at,
        mockUserData.updated_at,
        mockUserData.last_login_at
      );

      const result = UserMapper.toEntity(userEntity) as UserEntity;

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.id).toBe(mockUserData.id);
      expect(result.email).toBe(mockUserData.email);
      expect(result.username).toBe(mockUserData.username);
      expect(result.first_name).toBe(mockUserData.first_name);
      expect(result.last_name).toBe(mockUserData.last_name);
      expect(result.bio).toBe(mockUserData.bio);
      expect(result.avatar_url).toBe(mockUserData.avatar_url);
      expect(result.is_active).toBe(mockUserData.is_active);
      expect(result.email_verified).toBe(mockUserData.email_verified);
      expect(result.password_hash).toBe(mockUserData.password_hash);
      expect(result.created_at).toEqual(mockUserData.created_at);
      expect(result.updated_at).toEqual(mockUserData.updated_at);
      expect(result.last_login_at).toEqual(mockUserData.last_login_at);
    });

    it('should preserve password_hash when excludePassword is false', () => {
      const userEntity = new UserEntity(
        mockUserData.id,
        mockUserData.email,
        mockUserData.username,
        mockUserData.first_name,
        mockUserData.last_name,
        mockUserData.bio,
        mockUserData.avatar_url,
        mockUserData.is_active,
        mockUserData.email_verified,
        mockUserData.password_hash,
        mockUserData.created_at,
        mockUserData.updated_at,
        mockUserData.last_login_at
      );

      const result = UserMapper.toEntity(userEntity, false) as UserEntity;

      expect(result.password_hash).toBe(mockUserData.password_hash);
    });

    it('should exclude password_hash when excludePassword is true', () => {
      const userEntity = new UserEntity(
        mockUserData.id,
        mockUserData.email,
        mockUserData.username,
        mockUserData.first_name,
        mockUserData.last_name,
        mockUserData.bio,
        mockUserData.avatar_url,
        mockUserData.is_active,
        mockUserData.email_verified,
        mockUserData.password_hash,
        mockUserData.created_at,
        mockUserData.updated_at,
        mockUserData.last_login_at
      );

      const result = UserMapper.toEntity(userEntity, true) as UserEntity;

      expect(result.password_hash).toBeUndefined();
      expect(result.id).toBe(mockUserData.id);
      expect(result.email).toBe(mockUserData.email);
      expect(result.username).toBe(mockUserData.username);
    });

    it('should handle null values for optional fields', () => {
      const userEntityWithNulls = new UserEntity(
        mockUserData.id,
        mockUserData.email,
        mockUserData.username,
        mockUserData.first_name,
        mockUserData.last_name,
        null, // bio
        null, // avatar_url
        mockUserData.is_active,
        mockUserData.email_verified,
        mockUserData.password_hash,
        mockUserData.created_at,
        mockUserData.updated_at,
        null // last_login_at
      );

      const result = UserMapper.toEntity(userEntityWithNulls);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.bio).toBeNull();
      expect(result.avatar_url).toBeNull();
      expect(result.last_login_at).toBeNull();
      expect(result.id).toBe(mockUserData.id);
      expect(result.email).toBe(mockUserData.email);
    });

    it('should handle null values and exclude password simultaneously', () => {
      const userEntityWithNulls = new UserEntity(
        mockUserData.id,
        mockUserData.email,
        mockUserData.username,
        mockUserData.first_name,
        mockUserData.last_name,
        null,
        null,
        mockUserData.is_active,
        mockUserData.email_verified,
        mockUserData.password_hash,
        mockUserData.created_at,
        mockUserData.updated_at,
        null
      );

      const result = UserMapper.toEntity(
        userEntityWithNulls,
        true
      ) as UserEntity;

      expect(result.bio).toBeNull();
      expect(result.avatar_url).toBeNull();
      expect(result.last_login_at).toBeNull();
      expect(result.password_hash).toBeUndefined();
    });

    it('should create a new UserEntity instance, not return the same reference', () => {
      const userEntity = new UserEntity(
        mockUserData.id,
        mockUserData.email,
        mockUserData.username,
        mockUserData.first_name,
        mockUserData.last_name,
        mockUserData.bio,
        mockUserData.avatar_url,
        mockUserData.is_active,
        mockUserData.email_verified,
        mockUserData.password_hash,
        mockUserData.created_at,
        mockUserData.updated_at,
        mockUserData.last_login_at
      );

      const result = UserMapper.toEntity(userEntity);

      expect(result).not.toBe(userEntity);
      expect(result).toBeInstanceOf(UserEntity);
    });

    it('should handle inactive and unverified users', () => {
      const inactiveUser = new UserEntity(
        mockUserData.id,
        mockUserData.email,
        mockUserData.username,
        mockUserData.first_name,
        mockUserData.last_name,
        mockUserData.bio,
        mockUserData.avatar_url,
        false, // is_active
        false, // email_verified
        mockUserData.password_hash,
        mockUserData.created_at,
        mockUserData.updated_at,
        mockUserData.last_login_at
      );

      const result = UserMapper.toEntity(inactiveUser);

      expect(result.is_active).toBe(false);
      expect(result.email_verified).toBe(false);
    });
  });
});
