import {
  AuthRepository,
  AuthDatasource,
  RegisterUserDto,
  UserWithoutPassword,
} from '@/domain/index';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly authDatasource: AuthDatasource) {}

  register(registerUserDto: RegisterUserDto): Promise<UserWithoutPassword> {
    return this.authDatasource.register(registerUserDto);
  }
}
