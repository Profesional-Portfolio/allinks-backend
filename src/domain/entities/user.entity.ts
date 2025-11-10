export class UserEntity {
  constructor(
    public id: string,
    public email: string,
    public username: string,
    public first_name: string,
    public last_name: string,
    public bio: string | null,
    public avatar_url: string | null,
    public is_active: boolean,
    public email_verified: boolean,
    public password_hash: string,
    public created_at: Date,
    public updated_at: Date,
    public last_login_at: Date | null
  ) {}
}

export type UserWithoutPassword = Omit<UserEntity, 'password_hash'>;
