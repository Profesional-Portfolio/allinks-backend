import { RegisterUserDto } from '../dtos/auth';
import { UserWithoutPassword } from '../entities';

export interface AuthRepository {
  register(registerUserDto: RegisterUserDto): Promise<UserWithoutPassword>;
}
