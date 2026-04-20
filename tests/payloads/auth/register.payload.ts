import { RegisterUserDto } from '@/domain/dtos';

export const validRegisterPayload: RegisterUserDto = {
  bio: '',
  email: 'test1@test.com',
  email_verified: false,
  first_name: 'Test',
  is_active: true,
  last_name: 'User',
  password: 'Password123!',
  username: 'testuser1',
};
