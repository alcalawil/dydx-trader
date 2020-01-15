import { IFundsBalances, IState } from '@entities';
import { gettersService, awsManager } from '@services';
import { logger } from '@shared';
import { BALANCES_CHANGES } from '@topics';
import SQSPublisher from '../SQSPublisher';
import SQSRouter from '../SQSRouter';

const router = new SQSRouter();
let _sqsPublisher: SQSPublisher;
let _state: IState;

router.createRoute(BALANCES_CHANGES, async (body: any) => {
  const topic = BALANCES_CHANGES;

  try {
    const { requestId, currentBalance = false } = body;

    const balanceResponse: IFundsBalances = currentBalance
      ? await gettersService.getBalances()
      : _state.balances;

    logger.debug(`Topic ${topic} is working`);
    awsManager.publishLogToSNS(topic, balanceResponse);
    publishResponseToSQS(BALANCES_CHANGES, requestId, balanceResponse);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

// TODO: Abstraer "publishResponseToSQS" para que lo usen diferentes rutas
const publishResponseToSQS = (topic: string, requestId: string, response: object) => {
  const body = JSON.stringify({ requestId, response });
  _sqsPublisher.publishToSQS(topic, body);
};

export default (sqsPublisher: SQSPublisher, state: IState) => {
  _sqsPublisher = sqsPublisher;
  _state = state;
  return router;
};
