import { ILogType, ILogBody } from '@entities';

export default abstract class Logger {
  private static loggers: Logger[] = [];

  public static async log(body: ILogBody, logType: ILogType) {
    Logger.loggers.map((logger) => logger.logMessage(body, logType));
  }

  public static add(logger: Logger) {
    Logger.loggers.push(logger);
  }

  public abstract logMessage(body: ILogBody, logType: ILogType): Promise<any>;
}
