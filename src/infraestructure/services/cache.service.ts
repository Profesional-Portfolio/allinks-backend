import { LinkEntity } from '@/domain/entities/link.entity';
import { UserWithoutPassword } from '@/domain/entities/user.entity';
import { ICacheService } from '@/domain/interfaces/index';

export class CacheService {
  private readonly KEY_PATTERNS = {
    LINKS: (userId: string) => `links:user:${userId}`,
    PLATFORMS_CONFIG: 'platforms:config',
    PUBLIC_PROFILE: (username: string) => `profile:public:${username}`,
    RATE_LIMIT: (endpoint: string, id: string) => `ratelimit:${endpoint}:${id}`,
    REFRESH_TOKEN: (userId: string) => `auth:refresh_token:${userId}`,
    SESSION: (userId: string) => `session:${userId}`,
    USER_PROFILE: (userId: string) => `profile:user:${userId}`,
  };

  private readonly TTL = {
    LINKS: 10 * 60, // 10 minutes
    PLATFORMS_CONFIG: 24 * 60 * 60, // 24 hours
    PUBLIC_PROFILE: 5 * 60, // 5 minutes
    RATE_LIMIT: 60 * 60, // 1 hour
    REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days
    SESSION: 24 * 60 * 60, // 24 hours
    USER_PROFILE: 10 * 60, // 10 minutes
  };

  constructor(private readonly cacheAdapter: ICacheService) {}

  async deleteRefreshToken(userId: string): Promise<void> {
    await this.cacheAdapter.del(this.KEY_PATTERNS.REFRESH_TOKEN(userId));
  }

  async getPlatformsConfig(): Promise<null | Record<
    string,
    { displayName: string; pattern: string }
  >> {
    const data = await this.cacheAdapter.get(
      this.KEY_PATTERNS.PLATFORMS_CONFIG
    );
    return data
      ? (JSON.parse(data) as Record<
          string,
          { displayName: string; pattern: string }
        >)
      : null;
  }

  async getPublicProfile(
    username: string
  ): Promise<null | (UserWithoutPassword & { links: LinkEntity[] })> {
    const data = await this.cacheAdapter.get(
      this.KEY_PATTERNS.PUBLIC_PROFILE(username)
    );
    return data
      ? (JSON.parse(data) as UserWithoutPassword & { links: LinkEntity[] })
      : null;
  }

  // 5. Rate Limiting
  async getRateLimit(
    endpoint: string,
    identifier: string
  ): Promise<null | { count: number; resetAt: string }> {
    const key = this.KEY_PATTERNS.RATE_LIMIT(endpoint, identifier);
    const data = await this.cacheAdapter.get(key);
    return data
      ? (JSON.parse(data) as { count: number; resetAt: string })
      : null;
  }

  async getRefreshToken(userId: string): Promise<null | string> {
    return await this.cacheAdapter.get(this.KEY_PATTERNS.REFRESH_TOKEN(userId));
  }

  async getSession(
    userId: string
  ): Promise<null | {
    email: string;
    lastActivity: string;
    roles: string[];
    userId: string;
    username: string;
  }> {
    const data = await this.cacheAdapter.get(this.KEY_PATTERNS.SESSION(userId));
    return data
      ? (JSON.parse(data) as {
          email: string;
          lastActivity: string;
          roles: string[];
          userId: string;
          username: string;
        })
      : null;
  }

  async getUserLinks(userId: string): Promise<LinkEntity[] | null> {
    const data = await this.cacheAdapter.get(this.KEY_PATTERNS.LINKS(userId));
    return data ? (JSON.parse(data) as LinkEntity[]) : null;
  }

  async getUserProfile(userId: string): Promise<null | UserWithoutPassword> {
    const data = await this.cacheAdapter.get(
      this.KEY_PATTERNS.USER_PROFILE(userId)
    );
    return data ? (JSON.parse(data) as UserWithoutPassword) : null;
  }

  async invalidateLinks(userId: string, username: string): Promise<void> {
    await Promise.all([
      this.cacheAdapter.del(this.KEY_PATTERNS.LINKS(userId)),
      this.cacheAdapter.del(this.KEY_PATTERNS.PUBLIC_PROFILE(username)),
    ]);
  }

  // Cache Invalidation Rules
  async invalidateProfile(userId: string, username: string): Promise<void> {
    await Promise.all([
      this.cacheAdapter.del(this.KEY_PATTERNS.USER_PROFILE(userId)),
      this.cacheAdapter.del(this.KEY_PATTERNS.PUBLIC_PROFILE(username)),
    ]);
  }

  async invalidateUserDeletion(
    userId: string,
    username: string
  ): Promise<void> {
    await Promise.all([
      this.cacheAdapter.del(this.KEY_PATTERNS.SESSION(userId)),
      this.cacheAdapter.del(this.KEY_PATTERNS.USER_PROFILE(userId)),
      this.cacheAdapter.del(this.KEY_PATTERNS.LINKS(userId)),
      this.cacheAdapter.del(this.KEY_PATTERNS.PUBLIC_PROFILE(username)),
    ]);
  }

  async invalidateUsernameChange(
    oldUsername: string,
    newUsername: string
  ): Promise<void> {
    await Promise.all([
      this.cacheAdapter.del(this.KEY_PATTERNS.PUBLIC_PROFILE(oldUsername)),
      this.cacheAdapter.del(this.KEY_PATTERNS.PUBLIC_PROFILE(newUsername)),
    ]);
  }

  // 6. Platform Configuration Cache
  async setPlatformsConfig(
    config: Record<string, { displayName: string; pattern: string }>
  ): Promise<void> {
    const key = this.KEY_PATTERNS.PLATFORMS_CONFIG;
    await this.cacheAdapter.setWithTTL(
      key,
      JSON.stringify(config),
      this.TTL.PLATFORMS_CONFIG
    );
  }

  // 2. Public Profile Cache
  async setPublicProfile(
    username: string,
    data: UserWithoutPassword & { links: LinkEntity[] }
  ): Promise<void> {
    const key = this.KEY_PATTERNS.PUBLIC_PROFILE(username);
    const cacheData = {
      ...data,
      cachedAt: new Date().toISOString(),
    };
    await this.cacheAdapter.setWithTTL(
      key,
      JSON.stringify(cacheData),
      this.TTL.PUBLIC_PROFILE
    );
  }

  async setRateLimit(
    endpoint: string,
    identifier: string,
    count: number
  ): Promise<void> {
    const key = this.KEY_PATTERNS.RATE_LIMIT(endpoint, identifier);
    const data = {
      count,
      resetAt: new Date(Date.now() + this.TTL.RATE_LIMIT * 1000).toISOString(),
    };
    await this.cacheAdapter.setWithTTL(
      key,
      JSON.stringify(data),
      this.TTL.RATE_LIMIT
    );
  }

  // 1.1 Refresh Token Cache
  async setRefreshToken(userId: string, token: string): Promise<void> {
    const key = this.KEY_PATTERNS.REFRESH_TOKEN(userId);
    await this.cacheAdapter.setWithTTL(key, token, this.TTL.REFRESH_TOKEN);
  }

  // 1. Session Cache
  async setSession(
    userId: string,
    data: {
      email: string;
      lastActivity: string;
      roles: string[];
      userId: string;
      username: string;
    }
  ): Promise<void> {
    const key = this.KEY_PATTERNS.SESSION(userId);
    await this.cacheAdapter.setWithTTL(
      key,
      JSON.stringify(data),
      this.TTL.SESSION
    );
  }

  // 4. Links Cache
  async setUserLinks(userId: string, links: LinkEntity[]): Promise<void> {
    const key = this.KEY_PATTERNS.LINKS(userId);
    await this.cacheAdapter.setWithTTL(
      key,
      JSON.stringify(links),
      this.TTL.LINKS
    );
  }

  // 3. User Profile Cache
  async setUserProfile(
    userId: string,
    data: UserWithoutPassword
  ): Promise<void> {
    const key = this.KEY_PATTERNS.USER_PROFILE(userId);
    await this.cacheAdapter.setWithTTL(
      key,
      JSON.stringify(data),
      this.TTL.USER_PROFILE
    );
  }
}
