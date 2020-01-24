import { IResponseParams, IAuthentication } from '@entities';
import { Utils } from '@CORE/utils';

export default class Response {
  private responseId?: string;
  private requestId: string;
  private authentication?: IAuthentication;
  private unixTimestamp: number;
  private speed: number;
  private expired?: boolean;
  private errorDescription?: string;

  constructor({
    responseId,
    requestId,
    authentication,
    unixTimestamp,
    speed,
    expired,
    errorDescription
  }: IResponseParams) {
    this.responseId = responseId || Utils.Guid.createId();
    this.requestId = requestId;
    this.authentication = authentication || undefined;
    this.unixTimestamp = unixTimestamp;
    this.speed = speed;
    this.expired = expired || false;
    this.errorDescription = errorDescription || '';
  }
}
