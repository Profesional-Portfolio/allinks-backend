import { Request, Response, NextFunction } from 'express';
import { LinksRepository } from '@/domain/repositories';
import { StatusCode } from '@/domain/enums';

export class AuthorizeBulkLinksMiddleware {
  constructor(private readonly linksRepository: LinksRepository) {}

  authorize = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let linkIds: string[] = [];

      const userId = req.user?.id!;

      if (req.body.linkIds && Array.isArray(req.body.linkIds)) {
        linkIds = req.body.linkIds;
      } else if (req.body.links && Array.isArray(req.body.links)) {
        console.log({ links: req.body.links });
        linkIds = req.body.links.map((link: any) =>
          typeof link === 'string' ? link : link.id
        );
      } else if (req.body.orders && Array.isArray(req.body.orders)) {
        linkIds = req.body.orders.map((item: any) => item.linkId || item.id);
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
      console.log({ invalidIds });
      if (invalidIds.length > 0) {
        return res.status(StatusCode.BAD_REQUEST).json({
          error: 'Bad Request',
          message: 'All link IDs must be valid strings',
        });
      }

      const [exception, links] = await this.linksRepository.getLinksByIds({
        ids: linkIds,
        user_id: userId,
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
    } catch (error) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      });
    }
  };
}
