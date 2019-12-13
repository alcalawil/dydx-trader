import { Solo, Networks } from '@dydxprotocol/solo';
import Web3 from 'web3';
import config from '../config';

function getSoloInstance(): Solo {
  const provider = new Web3.providers.HttpProvider(config.solo.httpProvider);
  return new Solo(provider, Networks.MAINNET);
}

// TODO: Inject Solo dependency as parameter?
export const soloManager = getSoloInstance();
