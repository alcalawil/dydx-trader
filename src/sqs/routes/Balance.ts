import { IFundsBalances, IState, ILogger } from '@entities';
import { gettersService } from '@services';
import { logger } from '@shared';
import { BALANCES_CHANGES } from '@topics';
import SQSPublisher from '../SQSPublisher';
import SQSRouter from '../SQSRouter';
import {
  STRATEGY_REQUEST_BALANCE_ATTEMPT,
  STRATEGY_REQUEST_BALANCE_COMPLETED,
  STRATEGY_REQUEST_BALANCE_ERROR
} from '../../constants/logTypes';

const router = new SQSRouter();
let _sqsPublisher: SQSPublisher;
let _state: IState;
let _logger: ILogger;

router.createRoute(BALANCES_CHANGES, async (body: any) => {
  const topic = BALANCES_CHANGES;
  const { requestId, currentBalance = false, strategyInfo } = body;
  try {
    _logger.LogMessage(
      {
        details: body,
        topic,
        ...strategyInfo
      },
      STRATEGY_REQUEST_BALANCE_ATTEMPT
    );
    const balanceResponse: IFundsBalances = currentBalance
      ? await gettersService.getBalances()
      : _state.balances;

    logger.debug(`Topic ${topic} is working`);
    _logger.LogMessage(
      {
        details: balanceResponse,
        topic,
        ...strategyInfo
      },
      STRATEGY_REQUEST_BALANCE_COMPLETED
    );
    publishResponseToSQS(BALANCES_CHANGES, requestId, balanceResponse);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    _logger.LogMessage(
      {
        details: err,
        topic,
        ...strategyInfo
      },
      STRATEGY_REQUEST_BALANCE_ERROR
    );
    throw err;
  }
});

// TODO: Abstraer "publishResponseToSQS" para que lo usen diferentes rutas
const publishResponseToSQS = (topic: string, requestId: string, response: object) => {
  const body = JSON.stringify({ requestId, response });
  _sqsPublisher.publishToSQS(topic, body);
};

export default (sqsPublisher: SQSPublisher, Logger: ILogger, state: IState) => {
  _sqsPublisher = sqsPublisher;
  _logger = Logger;
  _state = state;
  return router;
};
