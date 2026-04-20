export type UserWithoutPassword = Omit<UserEntity, 'password_hash'>;

export class UserEntity {
  constructor(
    public id: string,
    public email: string,
    public username: string,
    public first_name: string,
    public last_name: string,
    public bio: null | string,
    public avatar_url: null | string,
    public is_active: boolean,
    public email_verified: boolean,
    public password_hash: string,
    public created_at: Date,
    public updated_at: Date,
    public last_login_at: Date | null
  ) {}
}
