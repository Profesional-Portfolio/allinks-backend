import { doubleCsrf } from 'csrf-csrf';
import { Request } from 'express';
import { ENV } from '@/config/env';

export const {
  invalidCsrfTokenError, // This is the default error thrown when the CSRF token validation fails
  generateCsrfToken, // Use this in your routes to provide a CSRF hash + token cookie and token
  validateRequest, // Also a stand-alone validator
  doubleCsrfProtection, // This is the default CSRF protection middleware
} = doubleCsrf({
  getSecret: () => ENV.CSRF_SECRET, // A function that optionally takes the request and returns a secret
  cookieName: 'x-csrf-token', // The name of the cookie to be used, recommend using x-csrf-token
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict', // Recommend using strict
    secure: ENV.NODE_ENV === 'production',
    path: '/',
  },
  size: 64, // The size of the generated tokens in bits
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'], // A list of request methods that will not be protected.
  getCsrfTokenFromRequest: (req: Request) =>
    req.headers['x-csrf-token'] as string, // A function that returns the token from the request
  getSessionIdentifier: () => 'api-stateless', // Placeholder for stateless implementation
});
