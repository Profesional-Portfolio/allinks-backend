import cookies from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response, Router } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { StatusCode } from '@/domain/enums';
import { Exception } from '@/domain/exceptions';
import { ResponseFormatter } from '@/infraestructure/utils';

import { cacheClient, corsConfig, swaggerSpec } from '../config';
import {
  // doubleCsrfProtection,
  generateCsrfToken,
} from './middlewares/csrf.middleware';

interface ServerOptions {
  port: number;
  routes: Router;
}

export default class Server {
  public readonly app = express();
  get serverApp() {
    return this.app;
  }
  private readonly port: number;

  private readonly routes: Router;

  constructor(options: ServerOptions) {
    const { port, routes } = options;

    this.port = port;
    this.routes = routes;
  }

  async close() {
    if (cacheClient.isOpen) {
      await cacheClient.quit(); // Graceful shutdown
      console.log('Redis client disconnected');
    }
  }

  public async init() {
    try {
      if (!cacheClient.isOpen) {
        await cacheClient.connect();
        console.log('Redis client connected');
      }
    } catch (error) {
      console.error('Error connecting to Redis:', error);
    }
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  async start() {
    await this.init();
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port.toString()}`);
    });
  }

  private setupErrorHandling() {
    this.app.use((err: Error, _: Request, res: Response) => {
      console.error('Global Error Handler caught:', err);
      const exception = err as Exception;
      const statusCode =
        exception.statusCode || StatusCode.INTERNAL_SERVER_ERROR;
      const message = exception.message || 'Internal server error';
      return res
        .status(statusCode)
        .json(ResponseFormatter.error({ message, statusCode }));
    });

    this.app.use((_, res) => {
      res.status(StatusCode.NOT_FOUND).json(
        ResponseFormatter.error({
          message: 'Not found',
          statusCode: StatusCode.NOT_FOUND,
        })
      );
    });
  }
  private setupMiddlewares() {
    this.app.disable('x-powered-by');
    this.app.use(helmet());
    this.app.use(morgan('combined'));
    this.app.use(cors(corsConfig));
    this.app.use(cookies());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    // this.app.use(doubleCsrfProtection);
  }

  private setupRoutes() {
    this.app.get('/', (_, res) => {
      res
        .send(
          '<h1 style="color: blue; font-size: 2rem; text-align: center;">Hello world from the backend!!!!</h1>'
        )
        .status(StatusCode.OK);
    });

    this.app.get('/health', (_, res) => {
      res.status(StatusCode.OK).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    this.app.get('/api', (_, res) => {
      res.status(StatusCode.OK).json({ message: 'API is running' });
    });

    this.app.get('/api/csrf-token', (req, res) => {
      const csrfToken = generateCsrfToken(req, res);
      res.status(StatusCode.OK).json({ csrfToken });
    });

    this.app.use(this.routes);
    this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }
}
