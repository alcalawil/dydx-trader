import uuid from 'uuid';

export class Guid {
  // random id is created by default
  public static createId(random: boolean = true): string {
    const id = random ? uuid.v4() : uuid.v1();
    return id;
  }
}
