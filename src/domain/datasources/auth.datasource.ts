import { RegisterUserDto } from '../dtos/auth';
import { User } from '@/generated/prisma';

export interface AuthDatasource {
  register(payload: RegisterUserDto): Promise<User>;
}
