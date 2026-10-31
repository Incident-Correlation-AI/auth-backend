import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from './config.js';
import { router } from './routes.js';

const app = express();

if (config.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
const allowedOrigins = config.FRONTEND_ORIGIN.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (config.NODE_ENV === 'development' && origin.startsWith('http://localhost:'))
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(router);

app.use(
  (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    if (
      err instanceof SyntaxError &&
      'status' in err &&
      (err as { status: unknown }).status === 400
    ) {
      res.status(400).json({
        error: {
          code: 'bad_request',
          message: 'Invalid JSON payload',
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'internal_error',
        message: 'Internal server error',
      },
    });
  }
);

app.listen(config.PORT, () => {
  console.log(`Auth backend listening on port ${config.PORT}`);
});

export { app };
