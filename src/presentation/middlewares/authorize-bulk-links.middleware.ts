import { NextFunction, Request, Response } from 'express';

import { StatusCode } from '@/domain/enums';
import { LinksRepository } from '@/domain/repositories';

export class AuthorizeBulkLinksMiddleware {
  constructor(private readonly linksRepository: LinksRepository) {}

  authorize = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let linkIds: string[] = [];

      const userId = req.user?.id;
      const body = req.body as Record<string, unknown>;

      if (body.linkIds && Array.isArray(body.linkIds)) {
        linkIds = body.linkIds as string[];
      } else if (body.links && Array.isArray(body.links)) {
        linkIds = body.links.map((link: string | { id: string }) =>
          typeof link === 'string' ? link : link.id
        );
      } else if (body.orders && Array.isArray(body.orders)) {
        linkIds = body.orders.map((item: { id: string }) => item.id);
      }

      if (!linkIds.length) {
        return res.status(StatusCode.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'No link IDs provided',
        });
      }

      const invalidIds = linkIds.filter(
        id => typeof id !== 'string' || !id.trim()
      );
      if (invalidIds.length > 0) {
        return res.status(StatusCode.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'All link IDs must be valid strings',
        });
      }

      const [exception, links] = await this.linksRepository.getLinksByIds({
        ids: linkIds,
        user_id: userId ?? '',
      });

      if (exception) {
        return res.status(exception.statusCode || StatusCode.BAD_REQUEST).json({
          error: {
            code: exception.statusCode,
            message: exception.message,
          },
          message: exception.message,
        });
      }

      if (links.length !== linkIds.length) {
        return res.status(StatusCode.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'Some link IDs are not valid or do not belong to the user',
        });
      }

      next();
    } catch {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  };
}
