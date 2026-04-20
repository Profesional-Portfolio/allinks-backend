export interface IResponse<T> {
  data?: T;
  message: string;
  meta?: any;
  status: 'error' | 'success';
  statusCode: number;
  timestamp: string;
}

interface ErrorPayload {
  message: string;
  statusCode: number;
}

interface SuccessPayload<T> {
  data: T;
  message: string;
  meta?: any;
  statusCode: number;
}

export class ResponseFormatter {
  static error(payload: ErrorPayload): IResponse<null> {
    const { message, statusCode } = payload;
    return {
      message,
      status: 'error',
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static success<T>(payload: SuccessPayload<T>): IResponse<T> {
    const { data, message, meta, statusCode } = payload;
    return {
      data,
      message,
      meta,
      status: 'success',
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }
}
