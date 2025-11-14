import { LoginUserDto, RegisterUserDto } from '../dtos/auth';
import { UserWithoutPassword } from '../entities';

export interface AuthDatasource {
  register(payload: RegisterUserDto): Promise<UserWithoutPassword>;
  findUserByEmail(email: string): Promise<UserWithoutPassword>;
  findUserById(id: UserWithoutPassword['id']): Promise<UserWithoutPassword>;
  login(payload: LoginUserDto): Promise<UserWithoutPassword>;
  updateLastLogin(userId: UserWithoutPassword['id']): Promise<void>;
}
