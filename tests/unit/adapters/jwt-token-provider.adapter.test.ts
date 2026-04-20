import * as jwt from 'jsonwebtoken';

import { Exception } from '@/domain/exceptions';
import { TokenPayload } from '@/domain/interfaces';

import { JwtTokenProviderAdapter } from '../../../src/infraestructure/adapters/jwt-token-provider.adapter';

jest.mock('jsonwebtoken');

import { ENV } from '@/config/env';

const tokenProvider: JwtTokenProviderAdapter = new JwtTokenProviderAdapter();
describe('JwtTokenProviderAdapter', () => {
  const mockJwt = jwt as jest.Mocked<typeof jwt>;
  const secretKey = ENV.JWT_ACCESS_SECRET;
  const refreshSecretKey = ENV.JWT_REFRESH_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate access token correctly', async () => {
      const payload: TokenPayload = { email: 'test@test.com', id: '123' };
      const token = 'generated-token';

      mockJwt.sign.mockReturnValue(token as any);

      const [, result] = await tokenProvider.generateAccessToken(payload);

      expect(mockJwt.sign).toHaveBeenCalledWith(payload, secretKey, {
        expiresIn: '15m',
      });
      expect(result).toBe(token);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token correctly', async () => {
      const payload: TokenPayload = { email: 'test@test.com', id: '123' };
      const token = 'refresh-token';

      mockJwt.sign.mockReturnValue(token as any);

      const [, result] = await tokenProvider.generateRefreshToken(payload);

      expect(mockJwt.sign).toHaveBeenCalledWith(payload, refreshSecretKey, {
        expiresIn: '7d',
      });
      expect(result).toBe(token);
    });
  });

  describe('verifyToken', () => {
    it('should verify token correctly', async () => {
      const token = 'valid-token';
      const payload = { email: 'test@test.com', userId: '123' };

      mockJwt.verify.mockReturnValue(payload as any);

      const [, result] = await tokenProvider.verifyAccessToken(token);

      expect(mockJwt.verify).toHaveBeenCalledWith(token, secretKey);
      expect(result).toEqual(payload);
    });

    it('should handle invalid token', async () => {
      const token = 'invalid-token';

      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const [error] = await tokenProvider.verifyAccessToken(token);

      // expect(mockJwt.verify).toHaveBeenCalledWith(token, secretKey);
      expect(error).toBeInstanceOf(Exception);
    });

    describe('verifyRefreshToken', () => {
      it('should verify refresh token correctly', async () => {
        const token = 'valid-refresh-token';
        const payload = { userId: '123' };

        mockJwt.verify.mockReturnValue(payload as any);

        const [, result] = await tokenProvider.verifyRefreshToken(token);

        expect(mockJwt.verify).toHaveBeenCalledWith(token, refreshSecretKey);
        expect(result).toEqual(payload);
      });
    });
  });
});
