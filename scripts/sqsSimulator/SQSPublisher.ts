import { SQS } from 'aws-sdk';

export default class SQSPublisher {
  private sqs: SQS;
  private queueUrl: string;
  private sender: string;

  constructor(sqs: SQS, queueUrl: string, { sender = 'dydx-operator' }) {
    this.sqs = sqs;
    this.queueUrl = queueUrl;
    this.sender = sender;
  }

  public async publishToSQS(topic: string, body: string, extraAttributes: any = {}) {
    const publishParams: SQS.SendMessageRequest = {
      MessageBody: body,
      QueueUrl: this.queueUrl,
      MessageAttributes: {
        sender: {
          DataType: 'String',
          StringValue: this.sender
        },
        topic: {
          DataType: 'String',
          StringValue: topic
        },
        ...extraAttributes
      },
      MessageDeduplicationId: Date.now().toString(),
      MessageGroupId: 'DEFAULT_GROUP_ID' // Don't know if this will be useful
    };

    try {
      return this.sqs.sendMessage(publishParams).promise();
    } catch (err) {
      console.log('Publish to SQS Error', err);
      return null;
    }
  }
}
