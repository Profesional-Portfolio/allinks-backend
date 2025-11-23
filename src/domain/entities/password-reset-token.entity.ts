export class PasswordResetTokenEntity {
  public id: string;
  public user_id: string;
  public token: string;
  public expires_at: Date;
  public used_at: Date;
  public created_at: Date;

  constructor(
    id: string,
    user_id: string,
    token: string,
    expires_at: Date,
    used_at: Date,
    created_at: Date
  ) {
    this.id = id;
    this.user_id = user_id;
    this.token = token;
    this.expires_at = expires_at;
    this.used_at = used_at;
    this.created_at = created_at;
  }

  public isExpired(): boolean {
    return this.expires_at < new Date();
  }

  public isValid(): boolean {
    return !this.used_at && !this.isExpired();
  }

  public static fromObject(object: {
    [key: string]: any;
  }): PasswordResetTokenEntity {
    const { id, user_id, token, expires_at, used, created_at } = object;

    if (!id) throw new Error('id is required');
    if (!user_id) throw new Error('user_id is required');
    if (!token) throw new Error('token is required');
    if (!expires_at) throw new Error('expires_at is required');

    return new PasswordResetTokenEntity(
      id,
      user_id,
      token,
      new Date(expires_at),
      used ?? false,
      created_at ? new Date(created_at) : new Date()
    );
  }
}
