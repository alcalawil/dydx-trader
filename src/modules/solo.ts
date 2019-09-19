import { Solo, Networks } from '@dydxprotocol/solo';

import Web3 from 'web3';

// TODO: Avoid using empty as default value;
const DEFAULT_ADDRESS = process.env.DEFAULT_ADDRESS || '';
const HTTP_PROVIDER = process.env.HTTP_PROVIDER || '';

// TODO: Improve this
const getSoloInstance = (): Solo => {

  const provider = new Web3.providers.HttpProvider(HTTP_PROVIDER);
  return new Solo(provider, Networks.MAINNET, {
    defaultAccount: DEFAULT_ADDRESS
  });
};

export const solo = getSoloInstance();
