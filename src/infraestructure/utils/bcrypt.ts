import bcrypt from 'bcrypt';

export class BcryptAdapter {
  static async hash(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async compare(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
