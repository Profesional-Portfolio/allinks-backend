import { LoginUserDto, RegisterUserDto } from '../dtos/auth';

import { UserWithoutPassword } from '../entities';

export interface AuthRepository {
  register(registerUserDto: RegisterUserDto): Promise<UserWithoutPassword>;
  findUserByEmail(email: string): Promise<UserWithoutPassword>;
  findUserById(id: UserWithoutPassword['id']): Promise<UserWithoutPassword>;
  login(loginUserDto: LoginUserDto): Promise<UserWithoutPassword>;
  updateLastLogin(userId: UserWithoutPassword['id']): Promise<void>;
}
