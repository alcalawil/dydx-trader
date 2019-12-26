import { SQS } from 'aws-sdk';
import { Consumer } from 'sqs-consumer';
import { logger } from '@shared';
import { ISQSConsumer, ISQSRoute } from '@entities';
import config from '@config';

class SQSConsumer implements ISQSConsumer {
  public isRunning = false;
  private app: Consumer;
  private sqsRoutes: ISQSRoute[];
  private _sqs: SQS;
  private _queueUrl: string;

  constructor(sqs: SQS, queueUrl: string, sqsRoutes: ISQSRoute[]) {
    this.sqsRoutes = sqsRoutes;
    this._sqs = sqs;
    this._queueUrl = queueUrl;
    this.app = Consumer.create({
      queueUrl,
      messageAttributeNames: ['All'],
      handleMessage: this.messageHandler,
      sqs,
      batchSize: config.sqs.consumerBatchSize
    });
    // TODO: Create an err interface if needed
    this.app.on('error', (err: any) => {
      logger.error('SQS error', err);
    });
    this.app.on('processing_error', (err: any) => {
      logger.error('SQS processing_error', err);
    });
    this.app.on('timeout_error', (err: any) => {
      logger.error('SQS timeout_error', err);
    });
  }

  public start() {
    this.app.start();
  }

  public stop() {
    this.app.stop();
  }

  public async purge() {
    try {
      this.stop();
      await this._sqs.purgeQueue({ QueueUrl: this._queueUrl }).promise();
      logger.info(`Purge successfully for url: ${this._queueUrl}`);
    } catch (err) {
      logger.error('PURGE_QUEUE_ERROR', err);
    }
  }

  private messageHandler = async (message: SQS.Message) => {
    logger.debug('Message received', message)

    if (!message.MessageAttributes || !message.MessageAttributes.topic) {
      logger.error('INVALID OR EMPTY TOPIC', JSON.stringify(message));
      throw new Error('INVALID OR EMPTY TOPIC');
    }

    const { topic } = message.MessageAttributes; // topic should map 1:1 with http endpoints
    const body = JSON.parse(message.Body || ''); // body or querystring params
    const topicString = topic.StringValue || '';
    const sqsRoute = this.sqsRoutes.find((route) => route.topic === topicString);

    if (!sqsRoute) {
      logger.error(`TOPIC '${topicString}' NOT FOUND`, JSON.stringify(message));
      throw new Error(`TOPIC '${topicString}' NOT FOUND`);
    }

    await sqsRoute.handler(body);
    // TODO: Do something with result
    return;
  };
}

export default (sqs: SQS, queueUrl: string, sqsRoutes: ISQSRoute[]): ISQSConsumer =>
  new SQSConsumer(sqs, queueUrl, sqsRoutes);
