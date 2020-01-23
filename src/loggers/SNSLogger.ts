import { SNS } from 'aws-sdk';
import { logger } from '@shared';
import config from '@config';
import { snsDebugLogLevel, ILogType, ILogBody } from '@entities';
import { awsManager } from '@services';
import Logger from './Logger';

/* LOAD CONFIG */
const DEBUG_LOG_LEVEL: snsDebugLogLevel = config.sns.logLevel;
const APP_VERSION: string = config.app.version;
const AUTHOR: string = config.sqs.senderName;

export default class SNSLogger extends Logger {
  constructor(private sns: SNS, private topicArn: string) {
    super();
  }

  public async logMessage(body: ILogBody, logType: ILogType) {
    const { debugLogLevel, action, logLevel: logLvl, codeType } = logType;
    if (Number(debugLogLevel) <= Number(DEBUG_LOG_LEVEL)) {
      const publishParams: SNS.PublishInput = {
        TopicArn: this.topicArn,
        Message: JSON.stringify({ ...body, details: JSON.stringify(body.details) }),
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
            StringValue: awsManager.getInstanceId || 'undefined'
          },
          traderInstanceIp: {
            DataType: 'String',
            StringValue: awsManager.getAppIP || 'undefined'
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
            StringValue: codeType || 'undefined'
          },
          author: {
            DataType: 'String',
            StringValue: AUTHOR || 'none'
          }
        }
      };

      try {
        logger.debug(`Sending SNS Log`);
        return this.sns.publish(publishParams).promise();
      } catch (err) {
        logger.error('Publish to SNS LOG Error', err);
        return null;
      }
    }
  }
}
