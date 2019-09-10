import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
});

const kms = new AWS.KMS({
  region: process.env.KMS_REGION
});

const sns = new AWS.SNS({
  region: process.env.SNS_REGION
});

class AwsManager {
  public decrypt(encryptedData: string) {
    return new Promise((resolve, reject) => {
      const params = {
        CiphertextBlob: Buffer.from(encryptedData, 'base64')
      };

      kms.decrypt(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          const result: any = data.Plaintext;
          resolve(Buffer.from(result).toString());
        }
      });
    });
  }

  public encrypt(plainText: string) {
    return new Promise((resolve: any, reject: any) => {
      const key: any = process.env.KEY_ID;
      const params = {
        Plaintext: plainText,
        KeyId: key // The identifier of the CMK to use for encryption.
        // You can use the key ID or Amazon Resource Name (ARN) of the CMK,
        // or the name or ARN of an alias that refers to the CMK.
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

  public publish(msg: any) {
    return new Promise(async (resolve, reject) => {
      const publishParams: AWS.SNS.PublishInput = {
        TopicArn: process.env.SNS_ARN,
        Message: JSON.stringify(msg.Message),
        MessageAttributes: msg.MessageAttributes
      };

      sns.publish(publishParams, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  }
}

export default () => new AwsManager();
