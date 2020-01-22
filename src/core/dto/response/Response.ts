import { IResponseParams } from '@entities';

export class Response {
  public responseId: string;
  public requestId: string;
  public authentication: string;
  public timeStamp: number;
  public speed: number;
  public expired: boolean;
  public errorDescription: string;

  constructor({
    responseId,
    requestId,
    authentication,
    timeStamp,
    speed,
    expired,
    errorDescription
  }: IResponseParams) {
    this.responseId = responseId;
    this.requestId = requestId;
    this.authentication = authentication;
    this.timeStamp = timeStamp;
    this.speed = speed;
    this.expired = expired;
    this.errorDescription = errorDescription;
  }
}
