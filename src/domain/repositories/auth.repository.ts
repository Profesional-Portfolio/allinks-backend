import { LoginUserDto, RegisterUserDto } from '../dtos/auth';
import { Exception } from '../exceptions';
import { UserWithoutPassword } from '../entities';

export interface AuthRepository {
  register(
    payload: RegisterUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword]>;
  findUserByEmail(
    email: string
  ): Promise<[Exception | undefined, UserWithoutPassword]>;
  findUserById(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, UserWithoutPassword]>;
  login(
    payload: LoginUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword]>;
  updateLastLogin(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, string | undefined]>;
}
