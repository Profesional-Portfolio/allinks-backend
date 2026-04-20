export interface ICacheService {
  del(key: string): Promise<void>;
  get(key: string): Promise<null | string>;
  set(key: string, value: string): Promise<void>;
  setWithTTL(key: string, value: string, ttl: number): Promise<void>;
}
