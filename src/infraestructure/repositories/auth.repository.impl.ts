import {
  AuthRepository,
  AuthDatasource,
  LoginUserDto,
  RegisterUserDto,
  UserWithoutPassword,
} from '@/domain/index';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly authDatasource: AuthDatasource) {}

  register(registerUserDto: RegisterUserDto): Promise<UserWithoutPassword> {
    return this.authDatasource.register(registerUserDto);
  }

  findUserByEmail(email: string): Promise<UserWithoutPassword> {
    return this.authDatasource.findUserByEmail(email);
  }

  findUserById(id: UserWithoutPassword['id']): Promise<UserWithoutPassword> {
    return this.authDatasource.findUserById(id);
  }

  updateLastLogin(userId: UserWithoutPassword['id']): Promise<void> {
    return this.authDatasource.updateLastLogin(userId);
  }

  login(loginUserDto: LoginUserDto): Promise<UserWithoutPassword> {
    return this.authDatasource.login(loginUserDto);
  }
}
