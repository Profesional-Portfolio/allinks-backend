import { Request, Response, NextFunction } from 'express';
import { AuthMiddleware } from '@/presentation/middlewares/auth.middleware';
import { TokenProvider } from '@/domain/interfaces';
import { CacheService } from '@/infraestructure/services/cache.service';
import { StatusCode } from '@/domain/enums';
import { COOKIE_NAMES } from '@/infraestructure/utils';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('AuthMiddleware Unit Tests', () => {
  let authMiddleware: AuthMiddleware;
  let mockTokenProvider: DeepMockProxy<TokenProvider>;
  let mockCacheService: DeepMockProxy<CacheService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockTokenProvider = mockDeep<TokenProvider>();
    mockCacheService = mockDeep<CacheService>();
    authMiddleware = new AuthMiddleware(mockTokenProvider, mockCacheService);

    mockRequest = {
      cookies: {},
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    (nextFunction as jest.Mock).mockClear();
  });

  describe('authenticate', () => {
    it('should authenticate successfully with a valid cookie', async () => {
      const payload = { id: 'user-123', email: 'test@test.com', role: 'USER' };
      mockRequest.cookies![COOKIE_NAMES.ACCESS_TOKEN] = 'valid-token';
      mockTokenProvider.verifyAccessToken.mockResolvedValue([undefined, payload as any]);
      mockCacheService.getRefreshToken.mockResolvedValue('refresh-token');

      await authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockTokenProvider.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockCacheService.getRefreshToken).toHaveBeenCalledWith('user-123');
      expect(mockRequest.user).toEqual(payload);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should authenticate successfully with a valid Authorization header', async () => {
      const payload = { id: 'user-123', email: 'test@test.com', role: 'USER' };
      mockRequest.headers!.authorization = 'Bearer valid-header-token';
      mockTokenProvider.verifyAccessToken.mockResolvedValue([undefined, payload as any]);
      mockCacheService.getRefreshToken.mockResolvedValue('refresh-token');

      await authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockTokenProvider.verifyAccessToken).toHaveBeenCalledWith('valid-header-token');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should return 401 if no token is provided', async () => {
      await authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCode.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'error', message: 'No token provided' })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails', async () => {
      mockRequest.cookies![COOKIE_NAMES.ACCESS_TOKEN] = 'invalid-token';
      mockTokenProvider.verifyAccessToken.mockResolvedValue([{ message: 'Invalid token', statusCode: 401 } as any, undefined as any]);

      await authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCode.UNAUTHORIZED);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if session (refresh token) is not found in cache', async () => {
      const payload = { id: 'user-123', email: 'test@test.com' };
      mockRequest.cookies![COOKIE_NAMES.ACCESS_TOKEN] = 'valid-token';
      mockTokenProvider.verifyAccessToken.mockResolvedValue([undefined, payload as any]);
      mockCacheService.getRefreshToken.mockResolvedValue(null);

      await authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(StatusCode.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Session expired or revoked' })
      );
    });
  });

  describe('optionalAuthenticate', () => {
    it('should set req.user if a valid token is provided', async () => {
      const payload = { id: 'user-123', email: 'test@test.com' };
      mockRequest.cookies![COOKIE_NAMES.ACCESS_TOKEN] = 'valid-token';
      mockTokenProvider.verifyAccessToken.mockResolvedValue([undefined, payload as any]);
      mockCacheService.getRefreshToken.mockResolvedValue('some-refresh-token');

      await authMiddleware.optionalAuthenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toEqual(payload);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should NOT set req.user and call next if no token is provided', async () => {
      await authMiddleware.optionalAuthenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should NOT set req.user and call next if token is invalid', async () => {
      mockRequest.cookies![COOKIE_NAMES.ACCESS_TOKEN] = 'invalid-token';
      mockTokenProvider.verifyAccessToken.mockResolvedValue([{ message: 'err' } as any, undefined as any]);

      await authMiddleware.optionalAuthenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
