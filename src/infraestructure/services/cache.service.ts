import { ICacheService } from '@/domain/interfaces/index';
import { UserWithoutPassword } from '@/domain/entities/user.entity';
import { LinkEntity } from '@/domain/entities/link.entity';

export class CacheService {
  private readonly TTL = {
    SESSION: 24 * 60 * 60, // 24 hours
    PUBLIC_PROFILE: 5 * 60, // 5 minutes
    USER_PROFILE: 10 * 60, // 10 minutes
    LINKS: 10 * 60, // 10 minutes
    RATE_LIMIT: 60 * 60, // 1 hour
    PLATFORMS_CONFIG: 24 * 60 * 60, // 24 hours
  };

  private readonly KEY_PATTERNS = {
    SESSION: (userId: string) => `session:${userId}`,
    PUBLIC_PROFILE: (username: string) => `profile:public:${username}`,
    USER_PROFILE: (userId: string) => `profile:user:${userId}`,
    LINKS: (userId: string) => `links:user:${userId}`,
    RATE_LIMIT: (endpoint: string, id: string) => `ratelimit:${endpoint}:${id}`,
    PLATFORMS_CONFIG: 'platforms:config',
  };

  constructor(private readonly cacheAdapter: ICacheService) {}

  // 1. Session Cache
  async setSession(
    userId: string,
    data: {
      userId: string;
      email: string;
      username: string;
      roles: string[];
      lastActivity: string;
    }
  ): Promise<void> {
    const key = this.KEY_PATTERNS.SESSION(userId);
    await this.cacheAdapter.setWithTTL(
      key,
      JSON.stringify(data),
      this.TTL.SESSION
    );
  }

  async getSession(userId: string): Promise<any | null> {
    const data = await this.cacheAdapter.get(this.KEY_PATTERNS.SESSION(userId));
    return data ? JSON.parse(data) : null;
  }

  // 2. Public Profile Cache
  async setPublicProfile(username: string, data: any): Promise<void> {
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

  async getPublicProfile(username: string): Promise<any | null> {
    const data = await this.cacheAdapter.get(
      this.KEY_PATTERNS.PUBLIC_PROFILE(username)
    );
    return data ? JSON.parse(data) : null;
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

  async getUserProfile(userId: string): Promise<UserWithoutPassword | null> {
    const data = await this.cacheAdapter.get(
      this.KEY_PATTERNS.USER_PROFILE(userId)
    );
    return data ? JSON.parse(data) : null;
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

  async getUserLinks(userId: string): Promise<LinkEntity[] | null> {
    const data = await this.cacheAdapter.get(this.KEY_PATTERNS.LINKS(userId));
    return data ? JSON.parse(data) : null;
  }

  // 5. Rate Limiting
  async getRateLimit(
    endpoint: string,
    identifier: string
  ): Promise<{ count: number; resetAt: string } | null> {
    const key = this.KEY_PATTERNS.RATE_LIMIT(endpoint, identifier);
    const data = await this.cacheAdapter.get(key);
    return data ? JSON.parse(data) : null;
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

  // 6. Platform Configuration Cache
  async setPlatformsConfig(
    config: Record<string, { pattern: string; displayName: string }>
  ): Promise<void> {
    const key = this.KEY_PATTERNS.PLATFORMS_CONFIG;
    await this.cacheAdapter.setWithTTL(
      key,
      JSON.stringify(config),
      this.TTL.PLATFORMS_CONFIG
    );
  }

  async getPlatformsConfig(): Promise<any | null> {
    const data = await this.cacheAdapter.get(
      this.KEY_PATTERNS.PLATFORMS_CONFIG
    );
    return data ? JSON.parse(data) : null;
  }

  // Cache Invalidation Rules
  async invalidateProfile(userId: string, username: string): Promise<void> {
    await Promise.all([
      this.cacheAdapter.del(this.KEY_PATTERNS.USER_PROFILE(userId)),
      this.cacheAdapter.del(this.KEY_PATTERNS.PUBLIC_PROFILE(username)),
    ]);
  }

  async invalidateLinks(userId: string, username: string): Promise<void> {
    await Promise.all([
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
}
