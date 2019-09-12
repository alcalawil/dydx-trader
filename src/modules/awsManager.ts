import AWS from 'aws-sdk';
const kms = new AWS.KMS({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
});

class awsManager {

    public decrypt(data: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const params = {
                CiphertextBlob: Buffer.from(data, 'base64')
            };
            kms.decrypt(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    const result: any = data.Plaintext;
                    resolve(Buffer.from(result).toString('base64'));
                }
            });
        });
    }

    public encrypt(data: string) {
        return new Promise((resolve: any, reject: any) => {
            const key: any = process.env.KEY_ID;
            const params = {
                KeyId: key,
                Plaintext: data
            };
            kms.encrypt(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    const result: any = data.CiphertextBlob;
                    resolve(Buffer.from(result).toString('base64'));
                }
            });
        });
    }
}

export default () => new awsManager();
