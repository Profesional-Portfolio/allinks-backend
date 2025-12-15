import { Request, Response } from 'express';
import {
  registerUserDto,
  loginUseDto,
  verifyEmailDto,
  forgotPasswordDto,
  validateTokenDto,
  resetPasswordDto,
  resendEmailVerificationDto,
} from '@/domain/dtos';
import { StatusCode } from '@/domain/enums';
import { validate } from '../middlewares';
import {
  COOKIE_NAMES,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
} from '@/infraestructure/utils';
import {
  RegisterUserUseCase,
  LoginUserUseCase,
  RefreshTokenUseCase,
  SendWelcomeEmailUseCase,
  VerifyEmailUseCase,
  ResetPasswordUseCase,
  ForgotPasswordUseCase,
  ResendVerificationEmailUseCase,
  ValidateResetTokenUseCase,
} from '@/domain/use-cases/auth';
import { UploadImageUseCase } from '@/domain/index';
import { ResponseFormatter } from '@/infraestructure/utils';

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly sendWelcomeEmailUseCase: SendWelcomeEmailUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resendVerificationEmailUseCase: ResendVerificationEmailUseCase,
    private readonly validateTokenUseCase: ValidateResetTokenUseCase,
    private readonly uploadImageUseCase: UploadImageUseCase
  ) {}

  validateToken = async (req: Request, res: Response) => {
    const { token } = validate(validateTokenDto, req.body);

    const [error, message] = await this.validateTokenUseCase.execute(token);

    if (error) {
      return res.status(error.statusCode).json(
        ResponseFormatter.error({
          message: error.message,
          statusCode: error.statusCode,
        })
      );
    }

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: {},
        message: message!,
        statusCode: StatusCode.OK,
      })
    );
  };

  resetPassword = async (req: Request, res: Response) => {
    const data = validate(resetPasswordDto, req.body);
    const [error, message] = await this.resetPasswordUseCase.execute(data);

    if (error) {
      return res.status(error.statusCode).json(
        ResponseFormatter.error({
          message: error.message,
          statusCode: error.statusCode,
        })
      );
    }

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: {},
        message: message!,
        statusCode: StatusCode.OK,
      })
    );
  };

  forgotPassword = async (req: Request, res: Response) => {
    const data = validate(forgotPasswordDto, req.body);

    const [exception, message] = await this.forgotPasswordUseCase.execute(data);

    if (exception) {
      return res.status(exception.statusCode).json(
        ResponseFormatter.error({
          message: exception.message,
          statusCode: exception.statusCode,
        })
      );
    }

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: {},
        message: message!,
        statusCode: StatusCode.OK,
      })
    );
  };

  resendVerificationEmail = async (req: Request, res: Response) => {
    const data = validate(resendEmailVerificationDto, req.body);
    const [error, result] =
      await this.resendVerificationEmailUseCase.execute(data);

    if (error) {
      return res.status(error.statusCode).json(
        ResponseFormatter.error({
          message: error.message,
          statusCode: error.statusCode,
        })
      );
    }

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: {},
        message: 'Verification email sent successfully',
        statusCode: StatusCode.OK,
      })
    );
  };

  registerUser = async (req: Request, res: Response) => {
    const data = validate(registerUserDto, req.body);

    // upload image

    if (req.file) {
      const image = await this.uploadImageUseCase.execute(req.file.buffer);
      data.avatar_url = image.url;
    }

    const [error, result] = await this.registerUserUseCase.execute(data);

    if (error) {
      return res.status(error.statusCode).json(
        ResponseFormatter.error({
          message: error.message,
          statusCode: error.statusCode,
        })
      );
    }

    // Establecer cookies con los tokens
    res.cookie(
      COOKIE_NAMES.ACCESS_TOKEN,
      result.tokens.accessToken,
      accessTokenCookieOptions
    );
    res.cookie(
      COOKIE_NAMES.REFRESH_TOKEN,
      result.tokens.refreshToken,
      refreshTokenCookieOptions
    );

    const {
      user: { id, email, first_name },
    } = result;

    await this.sendWelcomeEmailUseCase.execute(id, email, first_name);

    return res.status(StatusCode.CREATED).json(
      ResponseFormatter.success({
        data: {
          user: result.user,
        },
        message: 'User registered successfully',
        statusCode: StatusCode.CREATED,
      })
    );
  };

  loginUser = async (req: Request, res: Response) => {
    const data = validate(loginUseDto, req.body);

    const [error, result] = await this.loginUserUseCase.execute(data);

    if (error) {
      return res.status(error.statusCode).json(
        ResponseFormatter.error({
          message: error.message,
          statusCode: error.statusCode,
        })
      );
    }

    if (!result) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
        ResponseFormatter.error({
          message: 'Login failed',
          statusCode: StatusCode.INTERNAL_SERVER_ERROR,
        })
      );
    }

    // Establecer cookies con los tokens
    res.cookie(
      COOKIE_NAMES.ACCESS_TOKEN,
      result.tokens.accessToken,
      accessTokenCookieOptions
    );
    res.cookie(
      COOKIE_NAMES.REFRESH_TOKEN,
      result.tokens.refreshToken,
      refreshTokenCookieOptions
    );

    // Devolver solo la información del usuario (sin tokens)
    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: {
          user: result.user,
        },
        message: 'Login successful',
        statusCode: StatusCode.OK,
      })
    );
  };

  refreshToken = async (req: Request, res: Response) => {
    // Obtener refresh token de las cookies en lugar del body
    const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

    if (!refreshToken) {
      return res.status(StatusCode.BAD_REQUEST).json(
        ResponseFormatter.error({
          message: 'Refresh token is required',
          statusCode: StatusCode.BAD_REQUEST,
        })
      );
    }

    const [error, tokens] =
      await this.refreshTokenUseCase.execute(refreshToken);

    if (error) {
      return res.status(error.statusCode).json(
        ResponseFormatter.error({
          message: error.message,
          statusCode: error.statusCode,
        })
      );
    }

    // Actualizar cookies con los nuevos tokens
    res.cookie(
      COOKIE_NAMES.ACCESS_TOKEN,
      tokens.accessToken,
      accessTokenCookieOptions
    );
    res.cookie(
      COOKIE_NAMES.REFRESH_TOKEN,
      tokens.refreshToken,
      refreshTokenCookieOptions
    );

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: {
          tokens,
        },
        message: 'Tokens refreshed successfully',
        statusCode: StatusCode.OK,
      })
    );
  };

  logout = async (req: Request, res: Response) => {
    // Limpiar cookies
    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, clearCookieOptions);
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, clearCookieOptions);

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: {},
        message: 'Logged out successfully',
        statusCode: StatusCode.OK,
      })
    );
  };

  verifyEmail = async (req: Request, res: Response) => {
    const token = req.query.token;

    if (!token) {
      return res.status(StatusCode.BAD_REQUEST).json(
        ResponseFormatter.error({
          message: 'Token is required',
          statusCode: StatusCode.BAD_REQUEST,
        })
      );
    }

    const validatedToken = validate(verifyEmailDto, { token });

    const [exception, message] =
      await this.verifyEmailUseCase.execute(validatedToken);

    if (exception) {
      return res.status(exception.statusCode).json(
        ResponseFormatter.error({
          message: exception.message,
          statusCode: exception.statusCode,
        })
      );
    }

    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: {},
        message: 'Email verified successfully',
        statusCode: StatusCode.OK,
      })
    );
  };

  getProfile = async (req: Request, res: Response) => {
    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: req.user,
        message: 'Profile retrieved successfully',
        statusCode: StatusCode.OK,
      })
    );
  };
}
