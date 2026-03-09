import { Request, Response, NextFunction } from 'express';
import { AuthorizeLinkOwnerMiddleware } from '@/presentation/middlewares/authorize-link-owner.middleware';
import { mockLinksRepository } from '../../__mocks__';
import { StatusCode } from '@/domain/enums';

describe('AuthorizeLinkOwnerMiddleware', () => {
  let middleware: AuthorizeLinkOwnerMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    middleware = new AuthorizeLinkOwnerMiddleware(mockLinksRepository);
    mockRequest = {
      user: { id: 'user-123' } as any,
      params: { id: 'link-123' },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next if user is the owner of the link', async () => {
    mockLinksRepository.getLinkById.mockResolvedValue([
      undefined,
      { id: 'link-123', user_id: 'user-123' } as any,
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
      { id: 'link-123', user_id: 'other-user' } as any,
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
