import { SQS } from 'aws-sdk';
import { logger } from '@shared';
import config from '@config';
import Logger from '../loggers/Logger';
import { SQS_MSJ_SENT } from '../constants/logTypes';

/* LOAD CONFIG */
const MSJ_GROUP_ID: string = config.sqs.msjGroupId;
const DEFAULT_SENDER: string = config.sqs.senderName;

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
      logger.debug(`SQS SENT to topic: ${topic}`);
      Logger.log({ details: body, topic }, SQS_MSJ_SENT);
      return this.sqs.sendMessage(publishParams).promise();
    } catch (err) {
      Logger.log(
        { details: { message: err.message, stack: err.stack }, topic },
        SQS_MSJ_SENT
      );
      logger.error('Publish to SQS Error', err);
      return null;
    }
  }
}
