import AWS from 'aws-sdk';
import { decrypt } from '../shared/utils';

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
});

// FIXME: This may throw an unhanled exception
const kms = new AWS.KMS({
  region: process.env.KMS_REGION
});

const sns = new AWS.SNS({
  region: process.env.SNS_REGION
});

const sm = new AWS.SecretsManager({
  region: process.env.SM_REGION
});

class AwsManager {
  // TODO: rename to kmsDecrypt
  // TODO: Return a static data type, a string maybe?
  public decrypt(encryptedData: string) {
    return new Promise((resolve, reject) => {
      const params = {
        CiphertextBlob: Buffer.from(encryptedData, 'base64')
      };

      kms.decrypt(params, (err, data) => {
        if (err) {
          // TODO: return reject
          reject(err);
        } else {
          const result: any = data.Plaintext;
          resolve(Buffer.from(result).toString('base64'));
        }
      });
    });
  }

  // TODO: rename to kmsEncrypt
  // TODO: Return a static data type, a string maybe?
  public encrypt(plainText: string) {
    return new Promise((resolve: any, reject: any) => {
      const key: any = process.env.KEY_ID;
      const params = {
        Plaintext: plainText,
        KeyId: key
      };

      kms.encrypt(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        const result: any = data.CiphertextBlob;
        resolve(Buffer.from(result).toString('base64'));
      });
    });
  }

  public publishToSNS(operation: string, message: string) {
    return new Promise((resolve, reject) => {
      const publishParams: AWS.SNS.PublishInput = {
        TopicArn: process.env.SNS_ARN || 'none',
        Message: message,
        MessageAttributes: {
          operation: {
            DataType: 'String',
            StringValue: operation
          }
        }
      };

      sns.publish(publishParams, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  }

  public getSecretValue(secretName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const params = {
        SecretId: secretName
      };
      sm.getSecretValue(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(JSON.parse(data.SecretString || '{}'));
      });
    });
  }

  public async decryptSecretName(privateKey: string) {
    const encryptedData = await this.getSecretValue(privateKey);
    const decryptedDataKey: any = await this.decrypt(encryptedData.DATA_KEY);
    return decrypt(decryptedDataKey, encryptedData.DATA);
  }

  // TODO: Add publishTOSQS function (There is a branch with that)
}

export default new AwsManager();
