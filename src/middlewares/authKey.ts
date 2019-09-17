import { logger } from '@shared';
import { Request, Response, NextFunction } from 'express';
import { BAD_REQUEST } from 'http-status-codes';

const clientApiKeyValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const clientApiKey: string =
    req.get('api_key') ||
    req.get('api-key') ||
    req.get('Authentication') ||
    'no-key';
  const apiKey = process.env.API_KEY;
  if (!clientApiKey) {
    logger.error('Missing Api Key');
    return res.status(BAD_REQUEST).json({
      status: false,
      response: 'Missing Api Key'
    });
  }

  if (clientApiKey === apiKey) {
    next();
  } else {
    logger.error('Invalid Api Key');
    return res.status(400).send({
      status: false,
      response: 'Invalid Api Key'
    });
  }
};

export const authKey = clientApiKeyValidation;
