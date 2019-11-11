import { Response, Request } from 'express';
import { IHTTPError } from '@entities';
import { NextFunction } from 'express';

function errorHandler(err: IHTTPError, req: Request, res: Response, next: NextFunction) {
  res.status(err.status).json({
    error: {
      message: err.message
    }
  });
}

export default errorHandler;
