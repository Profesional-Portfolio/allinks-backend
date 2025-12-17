import { Request, Response } from 'express';
import {
  CreateLinkUseCase,
  ChangeVisibilityUseCase,
  GetLinksUseCase,
  ReorderLinksUseCase,
  UpdateLinkUseCase,
} from '@/domain/use-cases/links/';
import { validate } from '../middlewares';
import { createLinkDto, reorderLinksDto, updateLinkDto } from '@/domain/dtos';
import { StatusCode } from '@/domain/enums';
import { ResponseFormatter } from '@/infraestructure/utils';

export class LinksController {
  constructor(
    private readonly getLinksUseCase: GetLinksUseCase,
    private readonly changeVisibilityUseCase: ChangeVisibilityUseCase,
    private readonly createLinkUseCase: CreateLinkUseCase,
    private readonly updateLinkUseCase: UpdateLinkUseCase,
    private readonly reorderLinksUseCase: ReorderLinksUseCase
  ) {}

  createLink = async (req: Request, res: Response) => {
    const user_id = req.user?.id as string;
    const data = validate(createLinkDto, { ...req.body, user_id });

    const [error, result] = await this.createLinkUseCase.execute({
      ...data,
      user_id,
    });

    if (error) {
      const statusCode = error.statusCode || StatusCode.BAD_REQUEST;
      return res.status(statusCode).json(
        ResponseFormatter.error({
          statusCode,
          message: error.message,
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

  getLinks = async (req: Request, res: Response) => {
    const user_id = req.user?.id as string;
    const [error, result] = await this.getLinksUseCase.execute({ user_id });

    if (error) {
      const statusCode = error.statusCode || StatusCode.BAD_REQUEST;
      return res.status(statusCode).json(
        ResponseFormatter.error({
          statusCode,
          message: error.message,
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

  updateLink = async (req: Request, res: Response) => {
    const user_id = req.user?.id as string;
    const { id } = req.params;
    const data = validate(updateLinkDto, { ...req.body, id, user_id });

    const [error, result] = await this.updateLinkUseCase.execute({
      ...data,
      user_id,
    });

    if (error) {
      const statusCode = error.statusCode || StatusCode.BAD_REQUEST;
      return res.status(statusCode).json(
        ResponseFormatter.error({
          statusCode,
          message: error.message,
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

  changeVisibility = async (req: Request, res: Response) => {
    const user_id = req.user?.id as string;
    const { id } = req.params;

    const [error, result] = await this.changeVisibilityUseCase.execute({
      id,
      user_id,
    });

    if (error) {
      const statusCode = error.statusCode || StatusCode.BAD_REQUEST;
      return res.status(statusCode).json(
        ResponseFormatter.error({
          statusCode,
          message: error.message,
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

  reorderLinks = async (req: Request, res: Response) => {
    const user_id = req.user?.id as string;
    const data = validate(reorderLinksDto, { ...req.body, user_id });

    const [error, result] = await this.reorderLinksUseCase.execute({
      ...data,
      user_id,
    });

    if (error) {
      const statusCode = error.statusCode || StatusCode.BAD_REQUEST;
      return res.status(statusCode).json(
        ResponseFormatter.error({
          statusCode,
          message: error.message,
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
}
