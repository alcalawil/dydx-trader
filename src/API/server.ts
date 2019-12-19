import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import { authKey, errorHandler, routeErrorHandler } from './middlewares';
import BaseRouter from './routes';
import config from '@config';

const app = express();

/* MIDDLEWARES */
config.app.nodeEnv === 'development' ? app.use(morgan('dev')) : null;
app
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(cors())
  .use(cookieParser())
  .use(authKey)
  .use('/api', BaseRouter)
  .use(routeErrorHandler)
  .use(errorHandler);

export default app;
