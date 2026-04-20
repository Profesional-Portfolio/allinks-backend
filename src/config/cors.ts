import { CorsOptions } from 'cors';

import { ENV } from './env';

export const corsConfig: CorsOptions = {
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true,
  exposedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  origin: function (origin, callback) {
    const whiteList = [ENV.MAIN_FRONTEND_HOST];

    if (!origin) {
      callback(null, true);
      return;
    }

    if (whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Error de CORS'));
    }
  },
};
