import cookieParser from 'cookie-parser';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import logger from 'morgan';
import BaseRouter from './routes';
import cors from 'cors';
import { IHTTPError } from './entities/types';
import { authKey } from './middlewares/authKey';
import errorHandler from './middlewares/errorHandler';
import errorsConstants from './shared/errorsConstants';
const app = express();

// Add middleware/settings/routes to express.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use(authKey);
app.use('/api', BaseRouter);
app.use(errorHandler);

// Errors handling
// FIXME: Is this really needed?
app.use((req: Request, res: Response, next: NextFunction) => {
  const err: IHTTPError = errorsConstants.ROUTE_NOT_FOUND;
  res.status(err.status).json({
    error: {
      message: err.message
    }
  });
});

export default app;
