import { ITime } from '@entities';

export class Time implements ITime {
  public static current() {
    const date = new Date();

    const currentTime = {
      unix: Math.round(date.getTime() / 1000),
      utc: date.toISOString()
    };

    return currentTime;
  }

  public static createExpiration(extraTime: number): any {
    // const time = Time.current().unix;
    // TODO: crear nuevo time sumando el tiempo de expiracion
  }

  public static validateExpiration(expirationTime: number): any {
    // TODO:
  }

  public static calculateSpeed(resTime: number, reqTime: number): number {
    return Math.abs(resTime - reqTime);
  }
}
