import { UserEntity } from '@/domain/entities';

export const mockUser: UserEntity = {
  id: '123',
  email: 'test@test.com',
  first_name: 'Test',
  password_hash: 'hashed-password',
  created_at: new Date(),
  updated_at: new Date(),
  last_login_at: null,
  last_name: 'User',
  username: 'testuser',
  bio: '',
  avatar_url: '',
  is_active: true,
  email_verified: false,
};
