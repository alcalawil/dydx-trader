import AWS, { SQS, SNS, KMS, SecretsManager, MetadataService } from 'aws-sdk';
import { decrypt } from '@shared';
import config from '@config';
import { logLevel } from '@entities';

/* LOAD CONFIG */
AWS.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey
});

const region = config.aws.region;
// FIXME: This may throw an unhanled exception
const kms = new KMS({
  region: region.kms
});

const sns = new SNS({
  region: region.sns
});

const sm = new SecretsManager({
  region: region.sm
});

const sqs = new SQS({
  region: region.sqs
});

const ms = new MetadataService();

const SENDER_NAME: string = config.sqs.senderName;
const STRATEGY_QUEUE_URL: string = config.sqs.strategyQueueUrl;

/* CONSTANTS */
const ENCODING: BufferEncoding = 'base64';
let DEFAULT_APP_IP: string = config.app.ip;

class AwsManager {
  private appIp: string = DEFAULT_APP_IP;
  private instanceId: string = SENDER_NAME;

  constructor() {
    this.getInstanceIdFromMS();
    this.getPublicIPFromMS();
  }

  public kmsDecrypt(encryptedData: string) {
    return new Promise<string>((resolve: any, reject: any) => {
      const params = {
        CiphertextBlob: Buffer.from(encryptedData, ENCODING)
      };

      kms.decrypt(params, (err, data) => {
        if (err) {
          return reject(err);
        } else {
          const result: any = data.Plaintext;
          resolve(Buffer.from(result).toString(ENCODING));
        }
      });
    });
  }

  // TODO: La variable KEY_ID no esta definida en el "template.env"
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
        resolve(Buffer.from(result).toString(ENCODING));
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

  public async decryptSecretName(tagName: string) {
    const encryptedData = await this.getSecretValue(tagName);
    const decryptedDataKey: any = await this.kmsDecrypt(encryptedData.DATA_KEY);
    // TODO: Make it return a string type
    return decrypt(decryptedDataKey, encryptedData.DATA);
  }

  public publishToSQS(groupId: string, msg: any, extraAttributes: any = {}) {
    return new Promise<SQS.SendMessageResult>(async (resolve: any, reject: any) => {
      const publishParams: SQS.SendMessageRequest = {
        MessageBody: JSON.stringify(msg),
        QueueUrl: STRATEGY_QUEUE_URL,
        MessageAttributes: {
          sender: {
            DataType: 'String',
            StringValue: SENDER_NAME
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

  private getInstanceIdFromMS() {
    ms.request('/latest/meta-data/instance-id', (err, data) => {
      if (data) {
        this.instanceId = data;
      }
    });
  }

  public get getInstanceId() {
    return this.instanceId;
  }

  private getPublicIPFromMS() {
    ms.request('/latest/meta-data/public-ipv4', (err, data) => {
      if (data) {
        this.appIp = data;
      }
    });
  }

  public get getAppIP() {
    return this.appIp;
  }
}

export const awsManager = new AwsManager();
