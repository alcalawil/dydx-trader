import { Response, Request, NextFunction } from 'express';
import { IHTTPError } from '@entities';

export function errorHandler(
  err: IHTTPError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // It is checked if the headers were sent
  if (res.headersSent) {
    console.log('HANDLING_EXPRESS');
    // Error handling is delegated to Express
    return next(err);
  }

  // Error handling personalized
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message // TODO: create function interpretError
    }
  });
}
