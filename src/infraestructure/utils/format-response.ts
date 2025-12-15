export interface IResponse<T> {
  status: 'success' | 'error';
  statusCode: number;
  message: string;
  timestamp: string;
  data?: T;
  meta?: any;
}

interface SuccessPayload<T> {
  data: T;
  message: string;
  statusCode: number;
  meta?: any;
}

interface ErrorPayload {
  message: string;
  statusCode: number;
}

export class ResponseFormatter {
  static success<T>(payload: SuccessPayload<T>): IResponse<T> {
    const { data, message, statusCode, meta } = payload;
    return {
      status: 'success',
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      data,
      meta,
    };
  }

  static error(payload: ErrorPayload): IResponse<null> {
    const { message, statusCode } = payload;
    return {
      status: 'error',
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}
