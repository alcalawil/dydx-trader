import { Solo, Networks } from '@dydxprotocol/solo';
import awsManagerFactory from './awsManager';
import Web3 from 'web3';
import { decrypt } from '../shared/utils';

const awsManager = awsManagerFactory();
// TODO: Avoid using empty as default value;
const DEFAULT_ADDRESS = process.env.DEFAULT_ADDRESS || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const HTTP_PROVIDER = process.env.HTTP_PROVIDER || '';
const DATA_KEY = process.env.DATA_KEY || '';
const ENCRYPTED_PRIVATE_KEY = process.env.ENCRYPTED_PRIVATE_KEY || '';

// TODO: Improve this
const getSoloInstance = (): Solo => {
  const provider = new Web3.providers.HttpProvider(HTTP_PROVIDER);
  return new Solo(provider, Networks.MAINNET, {
    defaultAccount: DEFAULT_ADDRESS,
    accounts: [
      {
        address: DEFAULT_ADDRESS,
        privateKey: PRIVATE_KEY
      }
    ]
  });
};

const getDecryptedPrivateKey = async () => {
  let result: string = '';
  await awsManager.decrypt(DATA_KEY).then((res) => {
    result = decrypt(res, ENCRYPTED_PRIVATE_KEY);
  });
  return result;
};

export const solo = getSoloInstance();
