import 'express';

declare module 'express' {
  export interface Request {
    user?: {
      [key: string]: unknown;
      email: string;
      id: string;
    };
  }
}
