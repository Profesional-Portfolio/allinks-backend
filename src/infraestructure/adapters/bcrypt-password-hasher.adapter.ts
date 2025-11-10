import bcrypt from 'bcrypt';
import { PasswordHasher } from '@/domain/interfaces';

export class BcryptPasswordHasherAdapter implements PasswordHasher {
  constructor(private readonly saltRounds: number = 10) {}

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
