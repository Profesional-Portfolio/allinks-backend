import { RegisterUserDto } from '@/domain/dtos';

export const validRegisterPayload: RegisterUserDto = {
  email: 'test@test.com',
  password: 'Password123!',
  first_name: 'Test User',
  last_name: 'Test',
  username: 'testuser',
  is_active: true,
  email_verified: false,
  avatar_url: '',
  bio: '',
};
