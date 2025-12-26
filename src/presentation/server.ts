import express, { Request, Response, NextFunction, Router } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookies from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, cacheClient } from '../config';
import { StatusCode } from '@/domain/enums';
import { Exception } from '@/domain/exceptions';
import { ResponseFormatter } from '@/infraestructure/utils';
import {
  doubleCsrfProtection,
  generateCsrfToken,
} from './middlewares/csrf.middleware';

interface ServerOptions {
  port: number;
  routes: Router;
}

export default class Server {
  public readonly app = express();
  private readonly port: number;
  private readonly routes: Router;

  constructor(options: ServerOptions) {
    const { port, routes } = options;

    this.port = port;
    this.routes = routes;
  }

  private setupMiddlewares() {
    this.app.disable('x-powered-by');
    this.app.use(helmet());
    this.app.use(morgan('combined'));
    this.app.use(cors());
    this.app.use(cookies());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(doubleCsrfProtection);
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

  private setupErrorHandling() {
    this.app.use(
      (err: Error, _: Request, res: Response, next: NextFunction) => {
        const exception = err as Exception;
        const statusCode =
          exception.statusCode || StatusCode.INTERNAL_SERVER_ERROR;
        const message = exception.message || 'Internal server error';
        return res
          .status(statusCode)
          .json(ResponseFormatter.error({ statusCode, message }));
      }
    );

    this.app.use((_, res) => {
      res.status(StatusCode.NOT_FOUND).json(
        ResponseFormatter.error({
          statusCode: StatusCode.NOT_FOUND,
          message: 'Not found',
        })
      );
    });
  }

  public async init() {
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  get serverApp() {
    return this.app;
  }

  async start() {
    try {
      if (!cacheClient.isOpen) {
        await cacheClient.connect();
        console.log('Redis client connected');
      }
    } catch (error) {
      console.error('Error connecting to Redis:', error);
    }

    await this.init();

    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}
