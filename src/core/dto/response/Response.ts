import { ResponseParams, Authentication } from '@entities';
import { Guid } from '@utils';

export class Response {
  private responseId?: string;
  private requestId: string;
  private authentication?: Authentication;
  private unixTimestamp: number;
  private speed: number;
  private expired: boolean;
  private errorDescription: string;

  constructor({
    responseId,
    requestId,
    authentication,
    unixTimestamp,
    speed,
    expired,
    errorDescription
  }: ResponseParams) {
    this.responseId = responseId || Guid.createId();
    this.requestId = requestId;
    this.authentication = authentication || undefined;
    this.unixTimestamp = unixTimestamp;
    this.speed = speed;
    this.expired = expired;
    this.errorDescription = errorDescription;
  }
}
