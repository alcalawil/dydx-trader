import { Solo, Networks } from '@dydxprotocol/solo';

import Web3 from 'web3';

// TODO: Validate that ENV variables are loaded before being used
const HTTP_PROVIDER = process.env.HTTP_PROVIDER || '';

const getSoloInstance = (): Solo => {
  const provider = new Web3.providers.HttpProvider(HTTP_PROVIDER);
  return new Solo(provider, Networks.MAINNET);
};

// TODO: Inject Solo dependency as parameter?
export const solo = getSoloInstance();
