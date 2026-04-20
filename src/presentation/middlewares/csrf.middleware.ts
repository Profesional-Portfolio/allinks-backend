import { doubleCsrf } from 'csrf-csrf';
import { Request } from 'express';

import { ENV } from '@/config/env';

export const {
  doubleCsrfProtection, // This is the default CSRF protection middleware
  generateCsrfToken, // Use this in your routes to provide a CSRF hash + token cookie and token
  validateRequest, // Also a stand-alone validator
} = doubleCsrf({
  cookieName: 'x-csrf-token', // The name of the cookie to be used, recommend using x-csrf-token
  cookieOptions: {
    httpOnly: true,
    path: '/',
    sameSite: 'strict', // Recommend using strict
    secure: ENV.NODE_ENV === 'production',
  },
  getCsrfTokenFromRequest: (req: Request) => req.headers['x-csrf-token'] ?? '', // A function that returns the token from the request
  getSecret: () => ENV.CSRF_SECRET, // A function that optionally takes the request and returns a secret
  getSessionIdentifier: () => 'api-stateless', // Placeholder for stateless implementation
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'], // A list of request methods that will not be protected.
  size: 64, // The size of the generated tokens in bits
});
