import { UnauthorizedException } from '@/infraestructure/http';
import { JwtTokenProviderAdapter } from '../../../src/infraestructure/adapters/jwt-token-provider.adapter';
import * as jwt from 'jsonwebtoken';
import { Exception } from '@/domain/exceptions';

jest.mock('jsonwebtoken');

describe('JwtTokenProviderAdapter', () => {
  let tokenProvider: JwtTokenProviderAdapter;
  const mockJwt = jwt as jest.Mocked<typeof jwt>;
  const secretKey = 'xRtJMRFYvCxZWH/XlA4ft9MtPIQmrl6nS9V1F5L7Ehg=';
  const refreshSecretKey = 'DEB3WojlhZyUIcHD5wvVGcpTKQgvT+QqDabBf7MUS18=';

  beforeEach(() => {
    process.env.JWT_SECRET = secretKey;
    process.env.JWT_REFRESH_SECRET = refreshSecretKey;
    tokenProvider = new JwtTokenProviderAdapter();
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate access token correctly', async () => {
      const payload = { userId: '123', email: 'test@test.com' };
      const token = 'generated-token';

      mockJwt.sign.mockReturnValue(token as any);

      const [error, result] = await tokenProvider.generateAccessToken(payload);

      expect(mockJwt.sign).toHaveBeenCalledWith(payload, secretKey, {
        expiresIn: '15m',
      });
      expect(result).toBe(token);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token correctly', async () => {
      const payload = { userId: '123', email: 'test@test.com' };
      const token = 'refresh-token';

      mockJwt.sign.mockReturnValue(token as any);

      const [error, result] = await tokenProvider.generateRefreshToken(payload);

      expect(mockJwt.sign).toHaveBeenCalledWith(payload, refreshSecretKey, {
        expiresIn: '7d',
      });
      expect(result).toBe(token);
    });
  });

  describe('verifyToken', () => {
    it('should verify token correctly', async () => {
      const token = 'valid-token';
      const payload = { userId: '123', email: 'test@test.com' };

      mockJwt.verify.mockReturnValue(payload as any);

      const [error, result] = await tokenProvider.verifyAccessToken(token);

      expect(mockJwt.verify).toHaveBeenCalledWith(token, secretKey);
      expect(result).toEqual(payload);
    });

    it('should handle invalid token', async () => {
      const token = 'invalid-token';

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const [error, result] = await tokenProvider.verifyAccessToken(token);

      // expect(mockJwt.verify).toHaveBeenCalledWith(token, secretKey);
      expect(error).toBeInstanceOf(Exception);
    });

    describe('verifyRefreshToken', () => {
      it('should verify refresh token correctly', async () => {
        const token = 'valid-refresh-token';
        const payload = { userId: '123' };

        mockJwt.verify.mockReturnValue(payload as any);

        const [error, result] = await tokenProvider.verifyRefreshToken(token);

        expect(mockJwt.verify).toHaveBeenCalledWith(token, refreshSecretKey);
        expect(result).toEqual(payload);
      });
    });
  });
});
