import { CacheService } from '@/infraestructure/services/cache.service';
import { Exception } from '@/domain/exceptions';

export class LogoutUserUseCase {
  constructor(private readonly cacheService: CacheService) {}

  async execute(userId: string): Promise<[Exception | undefined, string]> {
    try {
      await this.cacheService.deleteRefreshToken(userId);
      return [undefined, 'Logged out successfully'];
    } catch (error) {
      const exception = new Exception('Error during logout', 500);
      return [exception, ''];
    }
  }
}
