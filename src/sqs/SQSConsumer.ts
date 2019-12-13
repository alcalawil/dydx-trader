import { SQS } from 'aws-sdk';
import { Consumer } from 'sqs-consumer';
import { logger } from '@shared';
import { ISQSConsumer, ISQSRoute } from '@entities';

class SQSConsumer implements ISQSConsumer {
  public isRunning = false;
  private app: Consumer;
  private sqsRoutes: ISQSRoute[];

  constructor(sqs: SQS, queueUrl: string, sqsRoutes: ISQSRoute[]) {
    this.sqsRoutes = sqsRoutes;
    this.app = Consumer.create({
      queueUrl: queueUrl,
      messageAttributeNames: ['All'],
      handleMessage: this.messageHandler,
      sqs
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
