import cookieParser from 'cookie-parser';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import logger from 'morgan';
import BaseRouter from './routes';
import cors from 'cors';
import { IError } from './entities/types';
import { authKey } from './middlewares/authKey';

const app = express();

// Add middleware/settings/routes to express.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use(authKey);
app.use('/api', BaseRouter);

// Errors handling
app.use((req: Request, res: Response, next: NextFunction) => {
  const err: IError = new Error('There was an error');
  err.status = 404;
  next(err);
});

app.use((error: IError, req: Request, res: Response) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

export default app;
