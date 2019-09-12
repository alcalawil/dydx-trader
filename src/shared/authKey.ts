import { logger } from '@shared';
import { Request, Response, NextFunction } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';

const clientApiKeyValidation = async (req: Request, res: Response, next: NextFunction) => {
    const clientApiKey: any = req.get('api_key');
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
