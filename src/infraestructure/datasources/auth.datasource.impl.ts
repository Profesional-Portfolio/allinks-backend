import { AuthDatasource, RegisterUserDto } from '@/domain/index';
import { prismadb } from '@/infraestructure/prismadb';
import { User } from '@/generated/prisma';
import { BadRequestException } from '@/infraestructure/http';

export class AuthDatasourceImpl implements AuthDatasource {
  constructor() {}

  async register(payload: RegisterUserDto): Promise<User> {
    try {
      const userExists = await prismadb.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (userExists) {
        throw new BadRequestException('User already exists');
      }

      const user = await prismadb.user.create({
        data: {
          ...payload,
          password_hash: '',
        },
      });
    } catch (error) {}
  }
}
