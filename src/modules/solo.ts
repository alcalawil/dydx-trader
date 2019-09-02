import { Solo, Networks } from '@dydxprotocol/solo';

import Web3 from 'web3';

// TODO: Avoid using empty as default value;
const DEFAULT_ADDRESS = process.env.DEFAULT_ADDRESS || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const HTTP_PROVIDER = process.env.HTTP_PROVIDER || '';

let solo: Solo | null = null;

// TODO: Improve this
const getSoloInstance = (): Solo | null => {
  if (solo) {
    return solo;
  }

  const provider = new Web3.providers.HttpProvider(HTTP_PROVIDER);
  solo = new Solo(provider, Networks.MAINNET, {
    defaultAccount: DEFAULT_ADDRESS,
    accounts: [
      {
        address: DEFAULT_ADDRESS,
        privateKey: PRIVATE_KEY
      }
    ]
  });

  return solo;
};

export default getSoloInstance;
