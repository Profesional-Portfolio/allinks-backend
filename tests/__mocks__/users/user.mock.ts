import { UserEntity, UserWithoutPassword } from '@/domain/entities';

export const mockUser: UserEntity = {
  avatar_url: '',
  bio: '',
  created_at: new Date(),
  email: 'test@test.com',
  email_verified: false,
  first_name: 'Test',
  id: '123',
  is_active: true,
  last_login_at: null,
  last_name: 'User',
  password_hash: 'hashed-password',
  updated_at: new Date(),
  username: 'testuser',
};

export const mockUserWithoutPassword: UserWithoutPassword = {
  avatar_url: '',
  bio: '',
  created_at: new Date(),
  email: 'test@test.com',
  email_verified: false,
  first_name: 'Test',
  id: '123',
  is_active: true,
  last_login_at: null,
  last_name: 'User',
  updated_at: new Date(),
  username: 'testuser',
};
