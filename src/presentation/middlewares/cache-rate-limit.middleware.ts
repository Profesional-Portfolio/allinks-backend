import { Request, Response, NextFunction } from 'express';
import { CacheService } from '@/infraestructure/services';
import { StatusCode } from '@/domain/enums';
import { ResponseFormatter } from '@/infraestructure/utils';

export class CacheRateLimitMiddleware {
  constructor(
    private readonly cacheService: CacheService,
    private readonly limit: number = 10, // max requests
    private readonly endpoint: string = 'general'
  ) {}

  handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Identify requester (UserId if authenticated, otherwise IP)
      const identifier = req.user?.id || req.ip || 'unknown';

      // 2. Get current rate limit status
      const status = await this.cacheService.getRateLimit(
        this.endpoint,
        identifier
      );

      const currentCount = status ? status.count : 0;

      // 3. Check if limit exceeded
      if (currentCount >= this.limit) {
        return res.status(StatusCode.TOO_MANY_REQUESTS).json(
          ResponseFormatter.error({
            message: 'Too many requests. Try again later.',
            statusCode: StatusCode.TOO_MANY_REQUESTS,
          })
        );
      }

      // 4. Increment count
      await this.cacheService.setRateLimit(
        this.endpoint,
        identifier,
        currentCount + 1
      );

      // 5. Set headers
      res.setHeader('X-RateLimit-Limit', this.limit);
      res.setHeader(
        'X-RateLimit-Remaining',
        Math.max(0, this.limit - (currentCount + 1))
      );
      if (status) {
        res.setHeader('X-RateLimit-Reset', status.resetAt);
      }

      next();
    } catch (error) {
      // If redis fails, we allow the request to proceed (Fail-open)
      console.error('Rate limit middleware error:', error);
      next();
    }
  };
}
