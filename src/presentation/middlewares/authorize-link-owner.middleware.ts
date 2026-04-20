import { NextFunction, Request, Response } from 'express';

import { StatusCode } from '@/domain/enums';
import { LinksRepository } from '@/domain/repositories';

export class AuthorizeLinkOwnerMiddleware {
  constructor(private readonly linksRepository: LinksRepository) {}

  authorize = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const linkId = req.params.id as string;
      const userId = req.user?.id;

      if (!linkId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'Link ID is required',
        });
      }

      const [exception, link] = await this.linksRepository.getLinkById({
        id: linkId,
      });

      if (!link) {
        return res.status(StatusCode.NOT_FOUND).json({
          error: {
            code: exception?.statusCode,
            message: exception?.message,
          },
          message: exception?.message,
        });
      }

      if (link.user_id !== userId) {
        return res.status(StatusCode.FORBIDDEN).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this link',
        });
      }

      next();
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error verifying link ownership',
      });
    }
  };
}
