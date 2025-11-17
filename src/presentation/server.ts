import express, { Request, Response, NextFunction, Router } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookies from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config';
import { StatusCode } from '@/domain/enums';

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

  async start() {
    this.app.disable('x-powered-by');
    this.app.use(helmet());
    this.app.use(morgan('combined'));
    this.app.use(cors());
    this.app.use(cookies());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(
      (err: Error, _: Request, res: Response, next: NextFunction) => {
        console.error('Fatal error:', err);
        return res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error' });
      }
    );

    this.app.get('/', (_, res) => {
      res.send('Hello world from the backend!!!!').status(StatusCode.OK);
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

    this.app.use(this.routes);
    this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    this.app.use((_, res) => {
      res.status(StatusCode.NOT_FOUND).json({ message: 'Not found' });
    });

    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}
