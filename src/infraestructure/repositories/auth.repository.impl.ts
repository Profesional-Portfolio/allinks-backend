import {
  AuthRepository,
  AuthDatasource,
  RegisterUserDto,
} from '@/domain/index';
import { User } from '@/generated/prisma';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly authDatasource: AuthDatasource) {}

  register(registerUserDto: RegisterUserDto): Promise<User> {
    return this.authDatasource.register(registerUserDto);
  }
}
