import { logger } from './Logger';

export const paramMissingError = 'One or more of the required parameters was missing.';

export const pErr = (err: Error) => {
  if (err) {
    logger.error(err);
  }
};

export const getRandomInt = () => {
  return Math.floor(Math.random() * 1_000_000_000_000);
};
