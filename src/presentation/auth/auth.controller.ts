import { Request, Response } from 'express';

import {
  forgotPasswordDto,
  loginUseDto,
  registerUserDto,
  resendEmailVerificationDto,
  resetPasswordDto,
  validateTokenDto,
  verifyEmailDto,
} from '@/domain/dtos';
import { StatusCode } from '@/domain/enums';
import { Exception, UploadImageUseCase } from '@/domain/index';
import {
  ForgotPasswordUseCase,
  LoginUserUseCase,
  LogoutUserUseCase,
  RefreshTokenUseCase,
  RegisterUserUseCase,
  ResendVerificationEmailUseCase,
  ResetPasswordUseCase,
  SendWelcomeEmailUseCase,
  ValidateResetTokenUseCase,
  VerifyEmailUseCase,
} from '@/domain/use-cases/auth';
import {
  accessTokenCookieOptions,
  clearCookieOptions,
  COOKIE_NAMES,
  refreshTokenCookieOptions,
} from '@/infraestructure/utils';
import { ResponseFormatter } from '@/infraestructure/utils';

import { validate } from '../middlewares';

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
    private readonly uploadImageUseCase: UploadImageUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase
  ) {}

  forgotPassword = async (req: Request, res: Response) => {
    try {
      const data = validate(
        forgotPasswordDto,
        req.body as Record<string, unknown>
      );

      const [exception, message] =
        await this.forgotPasswordUseCase.execute(data);

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
          message: message ?? '',
          statusCode: StatusCode.OK,
        })
      );
    } catch (e: unknown) {
      if (e instanceof Exception) {
        return res.status(e.statusCode).json(
          ResponseFormatter.error({
            message: e.message,
            statusCode: e.statusCode,
          })
        );
      }
      return res
        .status(500)
        .json({ message: 'Internal server error', status: 'error' });
    }
  };

  getProfile = (req: Request, res: Response) => {
    return res.status(StatusCode.OK).json(
      ResponseFormatter.success({
        data: req.user,
        message: 'Profile retrieved successfully',
        statusCode: StatusCode.OK,
      })
    );
  };

  loginUser = async (req: Request, res: Response) => {
    try {
      const data = validate(loginUseDto, req.body as Record<string, unknown>);

      const [error, result] = await this.loginUserUseCase.execute(data);

      if (error) {
        return res.status(error.statusCode).json(
          ResponseFormatter.error({
            message: error.message,
            statusCode: error.statusCode,
          })
        );
      }

      if (!result?.tokens) {
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
          ResponseFormatter.error({
            message: 'Login failed: Missing tokens',
            statusCode: StatusCode.INTERNAL_SERVER_ERROR,
          })
        );
      }

      console.log({ result });

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

      return res.status(StatusCode.OK).json(
        ResponseFormatter.success({
          data: {
            user: result.user,
          },
          message: 'Login successful',
          statusCode: StatusCode.OK,
        })
      );
    } catch (e: unknown) {
      if (e instanceof Exception) {
        return res.status(e.statusCode).json(
          ResponseFormatter.error({
            message: e.message,
            statusCode: e.statusCode,
          })
        );
      }
      return res
        .status(500)
        .json({ message: 'Internal server error', status: 'error' });
    }
  };

  logout = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (userId) {
      await this.logoutUserUseCase.execute(userId);
    }

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

  refreshToken = async (req: Request, res: Response) => {
    // Obtener refresh token de las cookies en lugar del body
    const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN] as string;

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

  registerUser = async (req: Request, res: Response) => {
    try {
      const data = validate(
        registerUserDto,
        req.body as Record<string, unknown>
      );

      if (req.file) {
        const image = await this.uploadImageUseCase.execute(req.file.buffer);
        if ('url' in image) {
          data.avatar_url = image.url;
        }
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

      if (!('tokens' in result)) {
        return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
          ResponseFormatter.error({
            message: 'Registration failed: Missing tokens',
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

      const {
        user: { email, first_name, id },
      } = result;

      try {
        await this.sendWelcomeEmailUseCase.execute(id, email, first_name);
      } catch (e) {
        console.error('Failed to send welcome email:', e);
      }

      return res.status(StatusCode.CREATED).json(
        ResponseFormatter.success({
          data: {
            user: result.user,
          },
          message: 'User registered successfully',
          statusCode: StatusCode.CREATED,
        })
      );
    } catch (e: unknown) {
      if (e instanceof Exception) {
        return res.status(e.statusCode).json(
          ResponseFormatter.error({
            message: e.message,
            statusCode: e.statusCode,
          })
        );
      }
      return res
        .status(500)
        .json({ message: 'Internal server error', status: 'error' });
    }
  };

  resendVerificationEmail = async (req: Request, res: Response) => {
    const data = validate(
      resendEmailVerificationDto,
      req.body as Record<string, unknown>
    );
    const [error] = await this.resendVerificationEmailUseCase.execute(data);

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

  resetPassword = async (req: Request, res: Response) => {
    try {
      const data = validate(
        resetPasswordDto,
        req.body as Record<string, unknown>
      );
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
          message: message ?? '',
          statusCode: StatusCode.OK,
        })
      );
    } catch (e: unknown) {
      if (e instanceof Exception) {
        return res.status(e.statusCode).json(
          ResponseFormatter.error({
            message: e.message,
            statusCode: e.statusCode,
          })
        );
      }
      return res
        .status(500)
        .json({ message: 'Internal server error', status: 'error' });
    }
  };

  validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = validate(
        validateTokenDto,
        req.body as Record<string, unknown>
      );

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
          message: message ?? '',
          statusCode: StatusCode.OK,
        })
      );
    } catch (e: unknown) {
      if (e instanceof Exception) {
        return res.status(e.statusCode).json(
          ResponseFormatter.error({
            message: e.message,
            statusCode: e.statusCode,
          })
        );
      }
      return res
        .status(500)
        .json({ message: 'Internal server error', status: 'error' });
    }
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

    const [exception] = await this.verifyEmailUseCase.execute(validatedToken);

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
}
