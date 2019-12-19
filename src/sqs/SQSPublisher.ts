import { SQS } from 'aws-sdk';
import { logger } from '@shared';
import config from '@config';

/* LOAD CONFIG */
const MSJ_GROUP_ID: string = config.sqs.msjGroupId;
const DEFAULT_SENDER: string = 'dydx-operator';

export default class SQSPublisher {
  private sqs: SQS;
  private queueUrl: string;
  private sender: string;

  constructor(sqs: SQS, queueUrl: string, { sender = DEFAULT_SENDER }) {
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
      MessageGroupId: MSJ_GROUP_ID
    };

    try {
      logger.debug('SQS SEND');
      return this.sqs.sendMessage(publishParams).promise();
    } catch (err) {
      logger.error('Publish to SQS Error', err);
      return null;
    }
  }
}
