export class Time {
  public static current() {
    const date = new Date();

    const currentTime = {
      unix: Math.round(date.getTime() / 1000),
      utc: date.toISOString()
    };

    return currentTime;
  }
}
