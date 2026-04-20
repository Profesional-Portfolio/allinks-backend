import { NextFunction, Request, Response } from 'express';

import { StatusCode } from '@/domain/enums';
import { AuthorizeLinkOwnerMiddleware } from '@/presentation/middlewares/authorize-link-owner.middleware';

import { mockLinksRepository } from '../../__mocks__';

describe('AuthorizeLinkOwnerMiddleware', () => {
  let middleware: AuthorizeLinkOwnerMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    middleware = new AuthorizeLinkOwnerMiddleware(mockLinksRepository);
    mockRequest = {
      params: { id: 'link-123' },
      user: { email: '', id: 'user-123' },
    };
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next if user is the owner of the link', async () => {
    mockLinksRepository.getLinkById.mockResolvedValue([
      undefined,
      {
        created_at: new Date(),
        display_order: 0,
        id: 'link-123',
        is_active: false,
        platform: '',
        title: '',
        updated_at: new Date(),
        url: '',
        user_id: 'user-123',
      },
    ]);

    await middleware.authorize(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
  });

  it('should return 403 if user is not the owner', async () => {
    mockLinksRepository.getLinkById.mockResolvedValue([
      undefined,
      {
        created_at: new Date(),
        display_order: 0,
        id: 'link-123',
        is_active: false,
        platform: '',
        title: '',
        updated_at: new Date(),
        url: '',
        user_id: 'other-user',
      },
    ]);

    await middleware.authorize(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCode.FORBIDDEN);
  });

  it('should return 404 if link not found', async () => {
    mockLinksRepository.getLinkById.mockResolvedValue([undefined, null]);

    await middleware.authorize(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCode.NOT_FOUND);
  });
});
