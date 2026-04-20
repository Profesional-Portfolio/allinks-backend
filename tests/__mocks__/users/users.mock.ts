import { RegisterUserDto } from '@/domain/dtos';

export const userOne: RegisterUserDto = {
  email: 'usertest1@test.com',
  first_name: 'Uno',
  last_name: 'User',
  password: 'Test123!',
  username: 'usertest1',
};

export const userTwo: RegisterUserDto = {
  email: 'usertest2@test.com',
  first_name: 'Dos',
  last_name: 'User',
  password: 'Test123!',
  username: 'usertest2',
};
