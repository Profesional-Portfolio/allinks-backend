import { RegisterUserDto } from '../dtos/auth';
import { UserWithoutPassword } from '../entities';

export interface AuthDatasource {
  register(payload: RegisterUserDto): Promise<UserWithoutPassword>;
}
