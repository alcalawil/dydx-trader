import AWS, { SQS, SNS, KMS, SecretsManager } from 'aws-sdk';
import { decrypt } from '../shared/utils';

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
});

// FIXME: This may throw an unhanled exception
const kms = new KMS({
  region: process.env.KMS_REGION
});

const sns = new SNS({
  region: process.env.SNS_REGION
});

const sm = new SecretsManager({
  region: process.env.SM_REGION
});

const sqs = new SQS({
  region: process.env.SQS_REGION
});

const SENDER: string = process.env.SENDER_NAME || '';

class AwsManager {
  
  public kmsDecrypt(encryptedData: string) {
    return new Promise<string>((resolve: any, reject: any) => {
      const params = {
        CiphertextBlob: Buffer.from(encryptedData, 'base64')
      };

      kms.decrypt(params, (err, data) => {
        if (err) {
          return reject(err);
        } else {
          const result: any = data.Plaintext;
          resolve(Buffer.from(result).toString('base64'));
        }
      });
    });
  }

  public kmsEncrypt(plainText: string) {
    return new Promise<string>((resolve: any, reject: any) => {
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

  public publishLogToSNS(operation: string, message: any, level: string = 'debug') {
    return new Promise<any>((resolve, reject) => {
      const publishParams: SNS.PublishInput = {
        TopicArn: process.env.SNS_ARN || 'none',
        Message: JSON.stringify(message),
        MessageAttributes: {
          operation: {
            DataType: 'String',
            StringValue: operation
          },
          level: {
            DataType: 'String',
            StringValue: level
          },
          timestamp: {
            DataType: 'String',
            StringValue: new Date().toISOString()
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

  public getSecretValue(secretName: string) {
    return new Promise<any>((resolve, reject) => {
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
    const decryptedDataKey: any = await this.kmsDecrypt(encryptedData.DATA_KEY);
    return decrypt(decryptedDataKey, encryptedData.DATA);
  }

  public publishToSQS(groupId: string, msg: any, extraAttributes: any = {}) {
    return new Promise<SQS.SendMessageResult>(async (resolve: any, reject: any) => {
      const publishParams: SQS.SendMessageRequest = {
        MessageBody: JSON.stringify(msg),
        QueueUrl: process.env.SQS_URL || 'none',
        MessageAttributes: {
          sender: {
            DataType: 'String',
            StringValue: SENDER
          },
          ...extraAttributes
        },
        MessageDeduplicationId: Date.now().toString(),
        MessageGroupId: groupId
      };

      sqs.sendMessage(publishParams, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  }
}

export default new AwsManager();
