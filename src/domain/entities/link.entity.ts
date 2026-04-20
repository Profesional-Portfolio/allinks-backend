export class LinkEntity {
  constructor(
    public id: string,
    public user_id: string,
    public platform: string,
    public url: string,
    public title: string,
    public display_order: number,
    public is_active: boolean,
    public created_at: Date,
    public updated_at: Date
  ) {}
}
