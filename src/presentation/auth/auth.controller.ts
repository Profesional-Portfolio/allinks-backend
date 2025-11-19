import { Request, Response } from 'express';
import {
  registerUserDto,
  loginUseDto,
  RegisterUserUseCase,
  LoginUserUseCase,
  RefreshTokenUseCase,
} from '@/domain/index';
import { StatusCode } from '@/domain/enums';
import { validate } from '../middlewares';
import {
  COOKIE_NAMES,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
} from '@/infraestructure/utils';

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase
  ) {}

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

  getProfile = async (req: Request, res: Response) => {
    return res.status(StatusCode.OK).json({ data: req.user });
  };
}
