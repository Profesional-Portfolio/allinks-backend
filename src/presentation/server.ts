import express, { Request, Response, NextFunction, Router } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { HttpStatus } from '@/infraestructure/http/http-status';

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
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(
      (err: Error, _: Request, res: Response, next: NextFunction) => {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Internal server error 1' });
      }
    );

    this.app.get('/', (_, res) => {
      res.send('Hello world from the backend!!!!').status(HttpStatus.OK);
    });

    this.app.get('/health', (_, res) => {
      res.status(HttpStatus.OK).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    this.app.get('/api', (_, res) => {
      res.status(HttpStatus.OK).json({ message: 'API is running' });
    });

    this.app.use(this.routes);

    this.app.use((_, res) => {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'Not found' });
    });

    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}
