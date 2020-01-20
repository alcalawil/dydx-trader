import { SNS } from 'aws-sdk';
import { logger } from '@shared';
import config from '@config';
import { logLevel, snsDebugLogLevel, ISNSLogger } from '@entities';
import { awsManager } from '@services';

/* LOAD CONFIG */
const DEFAULT_LOG_LEVEL: logLevel = 'debug';
const DEFAULT_DEBUG_LOG_LEVEL: snsDebugLogLevel = '1';
const DEBUG_LOG_LEVEL: snsDebugLogLevel = config.sqs.logLevel as snsDebugLogLevel;
const DEFAULT_INSTANCE: string = config.sqs.senderName;
const APP_VERSION: string = config.app.version;
const AUTHOR: string = 'TradeOps';

export default class SNSLogger implements ISNSLogger {
  constructor(private sns: SNS, private topicArn: string) {}

  public async LogMessage(
    action: string,
    body: any,
    logType: string,
    logLvl: logLevel = DEFAULT_LOG_LEVEL,
    dbgLogLvl: snsDebugLogLevel = DEFAULT_DEBUG_LOG_LEVEL
  ) {
    if (Number(dbgLogLvl) <= Number(DEBUG_LOG_LEVEL)) {
      const publishParams: SNS.PublishInput = {
        TopicArn: this.topicArn,
        Message: JSON.stringify(body),
        MessageAttributes: {
          action: {
            DataType: 'String',
            StringValue: action || 'undefined'
          },
          logLevel: {
            DataType: 'String',
            StringValue: logLvl || 'undefined'
          },
          traderInstanceId: {
            DataType: 'String',
            StringValue: awsManager.getInstanceId() || DEFAULT_INSTANCE
          },
          traderInstanceIp: {
            DataType: 'String',
            StringValue: awsManager.getPublicIP() || 'localhost'
          },
          traderSoftwareVersion: {
            DataType: 'String',
            StringValue: APP_VERSION || 'undefined'
          },
          timestamp: {
            DataType: 'String',
            StringValue: new Date().toISOString()
          },
          logType: {
            DataType: 'String',
            StringValue: logType || 'undefined'
          },
          author: {
            DataType: 'String',
            StringValue: AUTHOR || 'none'
          }
        }
      };

      try {
        logger.debug(`SNS LOG SENT`);
        return this.sns.publish(publishParams).promise();
      } catch (err) {
        logger.error('Publish to SNS LOG Error', err);
        return null;
      }
    }
    return;
  }
}
