import { Request, Response } from 'express';

import { createLinkDto, reorderLinksDto, updateLinkDto } from '@/domain/dtos';
import { StatusCode } from '@/domain/enums';
import { Exception } from '@/domain/exceptions';
import {
  ChangeVisibilityUseCase,
  CreateLinkUseCase,
  DeleteLinkUseCase,
  GetLinksUseCase,
  ReorderLinksUseCase,
  UpdateLinkUseCase,
} from '@/domain/use-cases/links';
import { ResponseFormatter } from '@/infraestructure/utils';

import { validate } from '../middlewares';

export class LinksController {
  constructor(
    private readonly getLinksUseCase: GetLinksUseCase,
    private readonly changeVisibilityUseCase: ChangeVisibilityUseCase,
    private readonly createLinkUseCase: CreateLinkUseCase,
    private readonly deleteLinkUseCase: DeleteLinkUseCase,
    private readonly updateLinkUseCase: UpdateLinkUseCase,
    private readonly reorderLinksUseCase: ReorderLinksUseCase
  ) {}

  changeVisibility = async (req: Request, res: Response) => {
    const user_id = req.user?.id ?? '';
    const id = req.params.id as string;

    const [error, result] = await this.changeVisibilityUseCase.execute({
      id,
      user_id,
    });

    if (error) {
      const statusCode = error.statusCode || StatusCode.BAD_REQUEST;
      return res.status(statusCode).json(
        ResponseFormatter.error({
          message: error.message,
          statusCode,
        })
      );
    }

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: result,
        message: 'Link visibility changed successfully',
        statusCode: StatusCode.OK,
      })
    );
  };

  createLink = async (req: Request, res: Response) => {
    const user_id = req.user?.id ?? '';
    const data = validate(createLinkDto, {
      ...(req.body as Record<string, unknown>),
      user_id,
    });

    const [error, result]: [Exception | undefined, unknown] =
      await this.createLinkUseCase.execute({
        ...data,
        user_id,
      });

    if (error) {
      const statusCode = error.statusCode || StatusCode.BAD_REQUEST;
      return res.status(statusCode).json(
        ResponseFormatter.error({
          message: error.message,
          statusCode,
        })
      );
    }

    return res.status(StatusCode.CREATED).json(
      ResponseFormatter.success({
        data: result,
        message: 'Link created successfully',
        statusCode: StatusCode.CREATED,
      })
    );
  };

  deleteLink = async (req: Request, res: Response) => {
    const user_id = req.user?.id ?? '';
    const id = req.params.id as string;

    const [error, result] = await this.deleteLinkUseCase.execute({
      id,
      user_id,
    });

    if (error) {
      const statusCode = error.statusCode || StatusCode.BAD_REQUEST;
      return res.status(statusCode).json(
        ResponseFormatter.error({
          message: error.message,
          statusCode,
        })
      );
    }

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: result,
        message: 'Link deleted successfully',
        statusCode: StatusCode.OK,
      })
    );
  };

  getLinks = async (req: Request, res: Response) => {
    const user_id = req.user?.id ?? '';
    const [error, result]: [Exception | undefined, unknown] =
      await this.getLinksUseCase.execute({ user_id });

    if (error) {
      const statusCode = error.statusCode || StatusCode.BAD_REQUEST;
      return res.status(statusCode).json(
        ResponseFormatter.error({
          message: error.message,
          statusCode,
        })
      );
    }

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: result,
        message: 'Links retrieved successfully',
        statusCode: StatusCode.OK,
      })
    );
  };

  reorderLinks = async (req: Request, res: Response) => {
    const user_id = req.user?.id ?? '';
    const data = validate(reorderLinksDto, {
      ...(req.body as Record<string, unknown>),
      user_id,
    });

    const [error, result]: [Exception | undefined, string] =
      await this.reorderLinksUseCase.execute({
        ...data,
        user_id,
      });

    if (error) {
      const statusCode = error.statusCode || StatusCode.BAD_REQUEST;
      return res.status(statusCode).json(
        ResponseFormatter.error({
          message: error.message,
          statusCode,
        })
      );
    }

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: result,
        message: 'Links reordered successfully',
        statusCode: StatusCode.OK,
      })
    );
  };

  updateLink = async (req: Request, res: Response) => {
    const user_id = req.user?.id ?? '';
    const { id } = req.params;
    const data = validate(updateLinkDto, {
      ...(req.body as Record<string, unknown>),
      id,
      user_id,
    });

    const [error, result]: [Exception | undefined, unknown] =
      await this.updateLinkUseCase.execute({
        ...data,
        user_id,
      });

    if (error) {
      const statusCode = error.statusCode || StatusCode.BAD_REQUEST;
      return res.status(statusCode).json(
        ResponseFormatter.error({
          message: error.message,
          statusCode,
        })
      );
    }

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: result,
        message: 'Link updated successfully',
        statusCode: StatusCode.OK,
      })
    );
  };
}
