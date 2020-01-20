import { ILogger, ILogType } from '@entities';

export default class Logger implements ILogger {
  private loggers: ILogger[] = [];

  public async LogMessage(body: any, logType: ILogType) {
    this.loggers.map((logger) => logger.LogMessage(body, logType));
  }

  public addLogger(logger: ILogger) {
    this.loggers.push(logger);
  }
}
