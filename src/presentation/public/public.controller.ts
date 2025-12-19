import { Request, Response } from 'express';
import { GetPublicProfileUseCase } from '@/domain/index';
import { ResponseFormatter } from '@/infraestructure/utils';
import { StatusCode } from '@/domain/enums';
import { validate } from '../middlewares';
import { getProfileDto } from '@/domain/index';

export class PublicController {
  constructor(
    private readonly getPublicProfileUseCase: GetPublicProfileUseCase
  ) {}

  public getPublicProfile = async (req: Request, res: Response) => {
    const { username } = validate(getProfileDto, req.params);

    const [error, data] = await this.getPublicProfileUseCase.execute(username);
    if (error)
      return res.status(error.statusCode).json(ResponseFormatter.error(error));

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data,
        message: 'Public profile retrieved successfully',
        statusCode: StatusCode.OK,
      })
    );
  };
}
