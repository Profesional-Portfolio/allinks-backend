export class EmailVerificationTokenEntity {
  public id: string;
  public user_id: string;
  public token: string;
  public expires_at: Date;
  public verified_at: Date | null;
  public created_at: Date;

  constructor(
    id: string,
    user_id: string,
    token: string,
    expires_at: Date,
    verified_at: Date,
    created_at: Date
  ) {
    this.id = id;
    this.user_id = user_id;
    this.token = token;
    this.expires_at = expires_at;
    this.verified_at = verified_at;
    this.created_at = created_at;
  }

  public isExpired(): boolean {
    return this.expires_at < new Date();
  }

  public isValid(): boolean {
    return !this.verified_at && !this.isExpired();
  }

  public static fromObject(object: {
    [key: string]: any;
  }): EmailVerificationTokenEntity {
    const { id, user_id, token, expires_at, verified_at, created_at } = object;

    if (!id) throw new Error('id is required');
    if (!user_id) throw new Error('userId is required');
    if (!token) throw new Error('token is required');
    if (!expires_at) throw new Error('expires_at is required');

    return new EmailVerificationTokenEntity(
      id,
      user_id,
      token,
      new Date(expires_at),
      verified_at && new Date(verified_at),
      created_at ? new Date(created_at) : new Date()
    );
  }
}
