import { Request, Response } from 'express';
import {
  registerUserDto,
  loginUseDto,
  RegisterUserUseCase,
  LoginUserUseCase,
  RefreshTokenUseCase,
} from '@/domain/index';
import { HttpStatus } from '@/infraestructure/http';
import { validate } from '../middlewares';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
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
    const result = await this.registerUserUseCase.execute(data);

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
    return res.status(HttpStatus.CREATED).json({
      data: {
        user: result.user,
      },
    });
  };

  loginUser = async (req: Request, res: Response) => {
    const data = validate(loginUseDto, req.body);

    const result = await this.loginUserUseCase.execute(data);

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
    return res.status(HttpStatus.OK).json({
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
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: 'Refresh token is required' });
    }

    const tokens = await this.refreshTokenUseCase.execute(refreshToken);

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

    return res.status(HttpStatus.OK).json({
      message: 'Tokens refreshed successfully',
    });
  };

  logout = async (req: Request, res: Response) => {
    // Limpiar cookies
    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, clearCookieOptions);
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, clearCookieOptions);

    return res.status(HttpStatus.OK).json({
      message: 'Logged out successfully',
    });
  };

  getProfile = async (req: AuthenticatedRequest, res: Response) => {
    return res.status(HttpStatus.OK).json({ data: req.user });
  };
}
