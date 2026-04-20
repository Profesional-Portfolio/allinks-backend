import { Request, Response } from 'express';

import { StatusCode } from '@/domain/enums';
import {
  CheckAvailabilityUsernameUseCase,
  GetPublicProfileUseCase,
} from '@/domain/index';
import { getProfileDto } from '@/domain/index';
import { ResponseFormatter } from '@/infraestructure/utils';

import { validate } from '../middlewares';

export class PublicController {
  constructor(
    private readonly getPublicProfileUseCase: GetPublicProfileUseCase,
    private readonly checkAvailabilityUsernameUseCase: CheckAvailabilityUsernameUseCase
  ) {}

  public checkUsernameAvailability = async (req: Request, res: Response) => {
    const { username } = validate(getProfileDto, req.params);

    const [, data] =
      await this.checkAvailabilityUsernameUseCase.execute(username);

    if (data) {
      return res.status(StatusCode.CONFLICT).json(
        ResponseFormatter.error({
          message: 'Username is not available',
          statusCode: StatusCode.CONFLICT,
        })
      );
    }

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data,
        message: 'Username is available',
        statusCode: StatusCode.OK,
      })
    );
  };

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
