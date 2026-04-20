import { CookieOptions } from 'express';

import { ENV } from '@/config/index';

const isProduction = ENV.NODE_ENV === 'production';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  CSRF_TOKEN: 'x-csrf-token',
  REFRESH_TOKEN: 'refreshToken',
};

// Configuración base para cookies
const baseCookieOptions: CookieOptions = {
  httpOnly: true, // No accesible desde JavaScript del cliente
  path: '/',
  sameSite: isProduction ? 'strict' : 'lax', // Protección CSRF
  secure: isProduction, // Solo HTTPS en producción
};

// Configuración para access token (15 minutos por defecto)
export const accessTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  domain: ENV.COOKIE_DOMAIN,
  maxAge: 15 * 60 * 1000, // 15 minutos en milisegundos
};

// Configuración para refresh token (7 días por defecto)
export const refreshTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  domain: ENV.COOKIE_DOMAIN,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
};

// Configuración para eliminar cookies
export const clearCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  domain: ENV.COOKIE_DOMAIN,
  maxAge: 0,
};
