import { Request, Response, NextFunction } from 'express';
import { TokenProvider } from '@/domain/interfaces';
import { UnauthorizedException } from '@/domain/exceptions';
import { COOKIE_NAMES } from '@/infraestructure/utils';
import { StatusCode } from '@/domain/enums';

// export interface AuthenticatedRequest extends Request {
//   user?: {
//     userId: string;
//     email: string;
//     [key: string]: unknown;
//   };
// }

export class AuthMiddleware {
  constructor(private readonly tokenProvider: TokenProvider) {}

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
        return res.status(StatusCode.UNAUTHORIZED).json({
          error: {
            code: StatusCode.UNAUTHORIZED,
            message: 'No token provided',
          },
        });
      }

      const [error, payload] =
        await this.tokenProvider.verifyAccessToken(token);

      if (error) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          error: {
            code: error.statusCode,
            message: error.message,
          },
        });
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

        if (error) {
          next();
        }
        req.user = payload;
      }

      next();
    } catch (error) {
      // En modo opcional, si falla la autenticación continuamos sin usuario
      next();
    }
  };
}
