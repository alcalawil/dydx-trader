import { Response, Request, NextFunction } from 'express';
import { IHTTPError } from '@entities';
import errorsConstants from '../../constants/Errors';

export function routeErrorHandler(req: Request, res: Response, next: NextFunction) {
  const err: IHTTPError = errorsConstants.ROUTE_NOT_FOUND;
  next({
    message: err.message
  });
}
