/**
 * @deprecated
 */

import { ISQSConsumer, ISQSRoute } from '@entities';
import { EventEmitter } from 'events';

class SQSService {
  private sqsConsumer: ISQSConsumer;
  private consumerEmitter: EventEmitter;

  constructor(sqsConsumer: ISQSConsumer, sqsRoutes: ISQSRoute[]) {
    this.sqsConsumer = sqsConsumer;
    this.consumerEmitter = this.sqsConsumer.emitter;
    this.subscribeToTopics(sqsRoutes);
  }
  // suscribirse a los eventos del consumer e invocar a las funciones de los managers

  public start() {
    this.sqsConsumer.start();
  }

  private subscribeToTopics(sqsRoutes: ISQSRoute[]) {
    // this.consumerEmitter.on('TEST_TOPIC', () => console.log('TEST_TOPIC Working'));
    // NEEDS TO BE TESTED
    sqsRoutes.map(({ topic, handler }) => {
      this.consumerEmitter.on(topic, handler);
    });
  }
}

export default (sqsConsumer: ISQSConsumer, sqsRoutes: ISQSRoute[]) =>
  new SQSService(sqsConsumer, sqsRoutes);
