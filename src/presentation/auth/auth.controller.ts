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
    private readonly validateTokenUseCase: ValidateResetTokenUseCase
  ) {}

  validateToken = async (req: Request, res: Response) => {
    const { token } = validate(validateTokenDto, req.body);

    const [error, message] = await this.validateTokenUseCase.execute(token);

    if (error) {
      return res.status(StatusCode.BAD_REQUEST).json({
        error: {
          code: error.statusCode,
          message: error.message,
        },
      });
    }

    return res.status(StatusCode.OK).json({ message });
  };

  resetPassword = async (req: Request, res: Response) => {
    const data = validate(resetPasswordDto, req.body);
    const [error, message] = await this.resetPasswordUseCase.execute(data);

    if (error) {
      return res.status(StatusCode.BAD_REQUEST).json({
        error: {
          code: error.statusCode,
          message: error.message,
        },
      });
    }

    return res.status(StatusCode.OK).json({ message });
  };

  forgotPassword = async (req: Request, res: Response) => {
    const data = validate(forgotPasswordDto, req.body);

    const [exception, message] = await this.forgotPasswordUseCase.execute(data);

    if (exception) {
      return res.status(StatusCode.BAD_REQUEST).json({
        error: {
          code: exception.statusCode,
          message: exception.message,
        },
      });
    }

    return res.status(StatusCode.OK).json({
      message,
    });
  };

  resendVerificationEmail = async (req: Request, res: Response) => {
    const data = validate(resendEmailVerificationDto, req.body);
    const [error, result] =
      await this.resendVerificationEmailUseCase.execute(data);

    if (error) {
      return res.status(StatusCode.BAD_REQUEST).json({
        error: {
          code: error.statusCode,
          message: error.message,
        },
      });
    }

    return res.status(StatusCode.OK).json(result);
  };

  registerUser = async (req: Request, res: Response) => {
    const data = validate(registerUserDto, req.body);
    const [error, result] = await this.registerUserUseCase.execute(data);

    if (error) {
      return res.status(StatusCode.BAD_REQUEST).json({
        error: {
          code: error.statusCode,
          message: error.message,
        },
      });
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

    // Devolver solo la información del usuario (sin tokens)
    return res.status(StatusCode.CREATED).json({
      data: {
        user: result.user,
      },
    });
  };

  loginUser = async (req: Request, res: Response) => {
    const data = validate(loginUseDto, req.body);

    const [error, result] = await this.loginUserUseCase.execute(data);

    if (error) {
      return res.status(StatusCode.UNAUTHORIZED).json({
        error: {
          code: error.statusCode,
          message: error.message,
        },
      });
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
    return res.status(StatusCode.OK).json({
      data: {
        user: result.user,
      },
    });
  };

  refreshToken = async (req: Request, res: Response) => {
    // Obtener refresh token de las cookies en lugar del body
    const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

    if (!refreshToken) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ error: 'Refresh token is required' });
    }

    const [error, tokens] =
      await this.refreshTokenUseCase.execute(refreshToken);

    if (error) {
      return res.status(StatusCode.UNAUTHORIZED).json({
        error: {
          code: error.statusCode,
          message: error.message,
        },
      });
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

    return res.status(StatusCode.OK).json({
      message: 'Tokens refreshed successfully',
    });
  };

  logout = async (req: Request, res: Response) => {
    // Limpiar cookies
    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, clearCookieOptions);
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, clearCookieOptions);

    return res.status(StatusCode.OK).json({
      message: 'Logged out successfully',
    });
  };

  verifyEmail = async (req: Request, res: Response) => {
    const token = req.query.token;

    if (!token) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ error: 'Token is required' });
    }

    const validatedToken = validate(verifyEmailDto, { token });

    const [exception, message] =
      await this.verifyEmailUseCase.execute(validatedToken);

    if (exception) {
      return res.status(StatusCode.BAD_REQUEST).json({
        error: {
          code: exception.statusCode,
          message: exception.message,
        },
      });
    }

    return res.status(StatusCode.OK).json({
      message,
    });
  };

  getProfile = async (req: Request, res: Response) => {
    return res.status(StatusCode.OK).json({ data: req.user });
  };
}
