import { Request, Response, NextFunction } from 'express';
import { TokenProvider } from '@/domain/interfaces';
import { COOKIE_NAMES } from '@/infraestructure/utils';
import { StatusCode } from '@/domain/enums';
import { ResponseFormatter } from '@/infraestructure/utils';
import { CacheService } from '@/infraestructure/services/cache.service';

export class AuthMiddleware {
  constructor(
    private readonly tokenProvider: TokenProvider,
    private readonly cacheService: CacheService
  ) {}

  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Primero intentar obtener el token de las cookies
      let token = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];

      // Si no hay token en cookies, intentar desde el header Authorization
      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return res.status(StatusCode.UNAUTHORIZED).json(
          ResponseFormatter.error({
            message: 'No token provided',
            statusCode: StatusCode.UNAUTHORIZED,
          })
        );
      }

      const [error, payload] =
        await this.tokenProvider.verifyAccessToken(token);

      if (error) {
        return res
          .status(StatusCode.UNAUTHORIZED)
          .json(ResponseFormatter.error(error));
      }

      // Verificar si la sesión (refresh token) existe en Redis
      const hasSession = await this.cacheService.getRefreshToken(payload.id);

      if (!hasSession) {
        return res.status(StatusCode.UNAUTHORIZED).json(
          ResponseFormatter.error({
            message: 'Session expired or revoked',
            statusCode: StatusCode.UNAUTHORIZED,
          })
        );
      }

      req.user = payload;

      next();
    } catch (error) {
      next(error);
    }
  };

  optionalAuthenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Primero intentar obtener el token de las cookies
      let token = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];

      // Si no hay token en cookies, intentar desde el header Authorization
      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (token) {
        const [error, payload] =
          await this.tokenProvider.verifyAccessToken(token);

        if (!error) {
          // Verificar si la sesión (refresh token) existe en Redis
          const hasSession = await this.cacheService.getRefreshToken(
            payload.id
          );
          if (hasSession) {
            req.user = payload;
          }
        }
      }

      next();
    } catch (error) {
      // En modo opcional, si falla la autenticación continuamos sin usuario
      next();
    }
  };
}
