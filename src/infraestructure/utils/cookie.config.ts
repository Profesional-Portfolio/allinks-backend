import { CookieOptions } from 'express';
import { ENV } from '@/config/index';

const isProduction = ENV.NODE_ENV === 'production';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

// Configuración base para cookies
const baseCookieOptions: CookieOptions = {
  httpOnly: true, // No accesible desde JavaScript del cliente
  secure: isProduction, // Solo HTTPS en producción
  sameSite: isProduction ? 'strict' : 'lax', // Protección CSRF
  path: '/',
};

// Configuración para access token (15 minutos por defecto)
export const accessTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: 15 * 60 * 1000, // 15 minutos en milisegundos
  domain: ENV.COOKIE_DOMAIN,
};

// Configuración para refresh token (7 días por defecto)
export const refreshTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
  domain: ENV.COOKIE_DOMAIN,
};

// Configuración para eliminar cookies
export const clearCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: 0,
  domain: ENV.COOKIE_DOMAIN,
};
