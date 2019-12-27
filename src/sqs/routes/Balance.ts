import { IFundsBalances, IState, ISNSLogger, logLevel, IStrategyInfo } from '@entities';
import { gettersService, awsManager } from '@services';
import { logger } from '@shared';
import { BALANCES_CHANGES } from '@topics';
import SQSPublisher from '../SQSPublisher';
import SQSRouter from '../SQSRouter';
import SNSLogger from '../../sns/SNSLogger';
import {
  STRATEGY_REQUEST_BALANCE_ATTEMPT,
  STRATEGY_REQUEST_BALANCE_COMPLETED,
  STRATEGY_REQUEST_BALANCE_ERROR
} from '../../constants/logTypes';

const router = new SQSRouter();
const DEBUG_LOG_LEVEL: logLevel = 'debug';
const ERROR_LOG_LEVEL: logLevel = 'error';
let _sqsPublisher: SQSPublisher;
let _state: IState;
let _snsLogger: ISNSLogger;

router.createRoute(BALANCES_CHANGES, async (body: any) => {
  const topic = BALANCES_CHANGES;
  const { requestId, currentBalance = false, strategyInfo } = body;
  try {
    _snsLogger.LogMessage(
      `Intento de ejecucion del topico: ${topic} completada.`,
      {
        details: body,
        topic,
        ...strategyInfo
      },
      STRATEGY_REQUEST_BALANCE_ATTEMPT,
      DEBUG_LOG_LEVEL,
      '4'
    );
    const balanceResponse: IFundsBalances = currentBalance
      ? await gettersService.getBalances()
      : _state.balances;

    logger.debug(`Topic ${topic} is working`);
    _snsLogger.LogMessage(
      `Ejecucion del topico: ${topic} completada.`,
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
    _snsLogger.LogMessage(
      `Error en la ejecucion del topico: ${topic}.`,
      {
        details: err,
        topic,
        ...strategyInfo
      },
      STRATEGY_REQUEST_BALANCE_ERROR,
      ERROR_LOG_LEVEL
    );
    throw err;
  }
});

// TODO: Abstraer "publishResponseToSQS" para que lo usen diferentes rutas
const publishResponseToSQS = (topic: string, requestId: string, response: object) => {
  const body = JSON.stringify({ requestId, response });
  _sqsPublisher.publishToSQS(topic, body);
};

export default (sqsPublisher: SQSPublisher, snsLogger: SNSLogger, state: IState) => {
  _sqsPublisher = sqsPublisher;
  _snsLogger = snsLogger;
  _state = state;
  return router;
};
