import { ITime } from '@entities'

export class Time implements ITime {
  public static current() {
    const date = new Date();

    const currentTime = {
      unix: Math.round(date.getTime() / 1000),
      utc: date.toISOString()
    };

    return currentTime;
  }

  public static expiration() {
    // const time = Time.current().unix;
    // TODO: crear nuevo time sumando el tiempo de expiracion
  }
}
