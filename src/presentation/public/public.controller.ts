import { Request, Response } from 'express';
import {
  CheckAvailabilityUsernameUseCase,
  GetPublicProfileUseCase,
} from '@/domain/index';
import { ResponseFormatter } from '@/infraestructure/utils';
import { StatusCode } from '@/domain/enums';
import { validate } from '../middlewares';
import { getProfileDto } from '@/domain/index';

export class PublicController {
  constructor(
    private readonly getPublicProfileUseCase: GetPublicProfileUseCase,
    private readonly checkAvailabilityUsernameUseCase: CheckAvailabilityUsernameUseCase
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

  public checkUsernameAvailability = async (req: Request, res: Response) => {
    const { username } = validate(getProfileDto, req.params);

    const [error, data] =
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
}
