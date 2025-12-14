import { RegisterUserDto } from '@/domain/dtos';

export const validRegisterPayload: RegisterUserDto = {
  email: 'test1@test.com',
  password: 'Password123!',
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser1',
  is_active: true,
  email_verified: false,
  bio: '',
};
