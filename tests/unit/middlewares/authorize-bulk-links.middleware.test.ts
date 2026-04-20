import { NextFunction, Request, Response } from 'express';

import { StatusCode } from '@/domain/enums';
import { AuthorizeBulkLinksMiddleware } from '@/presentation/middlewares/authorize-bulk-links.middleware';

import { mockLinksRepository } from '../../__mocks__';

describe('AuthorizeBulkLinksMiddleware', () => {
  let middleware: AuthorizeBulkLinksMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    middleware = new AuthorizeBulkLinksMiddleware(mockLinksRepository);
    mockRequest = {
      body: {},
      user: {
        email: '',
        id: 'user-123',
      },
    };
    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next if all links belong to the user', async () => {
    mockRequest.body = { linkIds: ['link-1', 'link-2'] };
    mockLinksRepository.getLinksByIds.mockResolvedValue([
      undefined,
      [
        {
          created_at: new Date(),
          display_order: 0,
          id: 'link-1',
          is_active: false,
          platform: '',
          title: '',
          updated_at: new Date(),
          url: '',
          user_id: '',
        },
        {
          created_at: new Date(),
          display_order: 0,
          id: 'link-2',
          is_active: false,
          platform: '',
          title: '',
          updated_at: new Date(),
          url: '',
          user_id: '',
        },
      ],
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
      [
        {
          created_at: new Date(),
          display_order: 0,
          id: 'link-1',
          is_active: false,
          platform: '',
          title: '',
          updated_at: new Date(),
          url: '',
          user_id: '',
        },
      ],
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
