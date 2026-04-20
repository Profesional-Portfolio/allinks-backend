export class PasswordResetTokenEntity {
  public created_at: Date;
  public expires_at: Date;
  public id: string;
  public token: string;
  public used_at: Date | null;
  public user_id: string;

  constructor(
    id: string,
    user_id: string,
    token: string,
    expires_at: Date,
    used_at: Date | null,
    created_at: Date
  ) {
    this.id = id;
    this.user_id = user_id;
    this.token = token;
    this.expires_at = expires_at;
    this.used_at = used_at;
    this.created_at = created_at;
  }

  public static fromObject(
    object: Record<string, unknown>
  ): PasswordResetTokenEntity {
    const { created_at, expires_at, id, token, used, user_id } = object;

    if (!id) throw new Error('id is required');
    if (!user_id) throw new Error('user_id is required');
    if (!token) throw new Error('token is required');
    if (!expires_at) throw new Error('expires_at is required');

    return new PasswordResetTokenEntity(
      id as string,
      user_id as string,
      token as string,
      new Date(expires_at as string),
      used ? new Date(used as string) : null,
      created_at ? new Date(created_at as string) : new Date()
    );
  }

  public isExpired(): boolean {
    return this.expires_at < new Date();
  }

  public isValid(): boolean {
    return !this.used_at && !this.isExpired();
  }
}
