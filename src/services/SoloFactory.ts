import { Solo, Networks, EthereumAccount } from '@dydxprotocol/solo';
import Web3 from 'web3';
import config from '../config';
import { logger } from '@shared';

let solo: Solo;

export const getSoloInstance = (): Solo => {
  if (solo) {
    return solo;
  }
  // Add logic here to return solo mock for testing purposes
  try {
    const provider = new Web3.providers.HttpProvider(config.server.httpProvider);
    solo = new Solo(provider, Networks.MAINNET);

    return solo;
  } catch (err) {
    logger.error('getSoloInstance ERROR', err);
    throw err;
  }
};
