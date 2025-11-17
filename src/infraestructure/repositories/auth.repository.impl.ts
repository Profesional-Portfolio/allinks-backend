import { Exception } from '@/domain/exceptions';
import {
  AuthRepository,
  AuthDatasource,
  LoginUserDto,
  RegisterUserDto,
  UserWithoutPassword,
} from '@/domain/index';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly authDatasource: AuthDatasource) {}

  register(
    registerUserDto: RegisterUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword]> {
    return this.authDatasource.register(registerUserDto);
  }

  findUserByEmail(
    email: string
  ): Promise<[Exception | undefined, UserWithoutPassword]> {
    return this.authDatasource.findUserByEmail(email);
  }

  findUserById(
    id: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, UserWithoutPassword]> {
    return this.authDatasource.findUserById(id);
  }

  updateLastLogin(
    userId: UserWithoutPassword['id']
  ): Promise<[Exception | undefined, string | undefined]> {
    return this.authDatasource.updateLastLogin(userId);
  }

  login(
    loginUserDto: LoginUserDto
  ): Promise<[Exception | undefined, UserWithoutPassword]> {
    return this.authDatasource.login(loginUserDto);
  }
}
