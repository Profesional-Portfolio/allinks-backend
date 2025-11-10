import {
  AuthDatasource,
  RegisterUserDto,
  UserWithoutPassword,
} from '@/domain/index';
import { prismadb } from '@/infraestructure/prismadb';
import { BadRequestException } from '@/infraestructure/http';
import { BcryptAdapter } from '../utils';
import { UserMapper } from '../mappers';

type HashFunction = (password: string) => Promise<string>;
type CompareFunction = (password: string, hashed: string) => Promise<boolean>;

export class AuthDatasourceImpl implements AuthDatasource {
  constructor(
    private readonly hashPassword: HashFunction = BcryptAdapter.hash,
    private readonly comparePassword: CompareFunction = BcryptAdapter.compare
  ) {}

  async register(payload: RegisterUserDto): Promise<UserWithoutPassword> {
    try {
      const userExists = await prismadb.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (userExists) {
        throw new BadRequestException('User already exists');
      }

      const { password, ...payloadWithoutPassword } = payload;

      const user = await prismadb.user.create({
        data: {
          ...payloadWithoutPassword,
          password_hash: await this.hashPassword(password),
        },
      });

      const mappedUser = UserMapper.userEntityFromObject(user);
      const { password_hash, ...userWithoutPassword } = mappedUser;

      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }
}
