import { LoginUserDto, RegisterUserDto } from '../dtos/auth';
import { UserWithoutPassword } from '../entities';
import { Exception } from '../exceptions';

export interface AuthDatasource {
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
