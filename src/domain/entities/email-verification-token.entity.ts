export class EmailVerificationTokenEntity {
  public created_at: Date;
  public expires_at: Date;
  public id: string;
  public token: string;
  public user_id: string;
  public verified_at: Date | null;

  constructor(
    id: string,
    user_id: string,
    token: string,
    expires_at: Date,
    verified_at: Date | null,
    created_at: Date
  ) {
    this.id = id;
    this.user_id = user_id;
    this.token = token;
    this.expires_at = expires_at;
    this.verified_at = verified_at;
    this.created_at = created_at;
  }

  public static fromObject(
    object: Record<string, unknown>
  ): EmailVerificationTokenEntity {
    const { created_at, expires_at, id, token, user_id, verified_at } = object;

    if (!id) throw new Error('id is required');
    if (!user_id) throw new Error('userId is required');
    if (!token) throw new Error('token is required');
    if (!expires_at) throw new Error('expires_at is required');

    return new EmailVerificationTokenEntity(
      id as string,
      user_id as string,
      token as string,
      new Date(expires_at as string),
      verified_at ? new Date(verified_at as string) : null,
      created_at ? new Date(created_at as string) : new Date()
    );
  }

  public isExpired(): boolean {
    return this.expires_at < new Date();
  }

  public isValid(): boolean {
    return !this.verified_at && !this.isExpired();
  }
}
