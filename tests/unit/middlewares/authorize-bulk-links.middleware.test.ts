import { Request, Response, NextFunction } from 'express';
import { AuthorizeBulkLinksMiddleware } from '@/presentation/middlewares/authorize-bulk-links.middleware';
import { mockLinksRepository } from '../../__mocks__';
import { StatusCode } from '@/domain/enums';

describe('AuthorizeBulkLinksMiddleware', () => {
  let middleware: AuthorizeBulkLinksMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    middleware = new AuthorizeBulkLinksMiddleware(mockLinksRepository);
    mockRequest = {
      user: { id: 'user-123' } as any,
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next if all links belong to the user', async () => {
    mockRequest.body = { linkIds: ['link-1', 'link-2'] };
    mockLinksRepository.getLinksByIds.mockResolvedValue([
      undefined,
      [{ id: 'link-1' }, { id: 'link-2' }] as any,
    ]);

    await middleware.authorize(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
  });

  it('should return 400 if no link IDs are provided', async () => {
    mockRequest.body = { linkIds: [] };

    await middleware.authorize(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCode.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'No link IDs provided' })
    );
  });

  it('should return 400 if some links do not belong to the user', async () => {
    mockRequest.body = { linkIds: ['link-1', 'link-2'] };
    mockLinksRepository.getLinksByIds.mockResolvedValue([
      undefined,
      [{ id: 'link-1' }] as any,
    ]);

    await middleware.authorize(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCode.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Some link IDs are not valid or do not belong to the user',
      })
    );
  });
});
