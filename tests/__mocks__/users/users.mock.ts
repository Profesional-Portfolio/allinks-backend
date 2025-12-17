import { RegisterUserDto } from '@/domain/dtos';

export const userOne: RegisterUserDto = {
  email: 'usertest1@test.com',
  first_name: 'Uno',
  last_name: 'User',
  username: 'usertest1',
  password: 'Test123!',
};

export const userTwo: RegisterUserDto = {
  email: 'usertest2@test.com',
  first_name: 'Dos',
  last_name: 'User',
  username: 'usertest2',
  password: 'Test123!',
};
