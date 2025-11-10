import { User } from '@/generated/prisma';
import { RegisterUserDto } from '../dtos/auth';

export interface AuthRepository {
  register(registerUserDto: RegisterUserDto): Promise<User>;
}
