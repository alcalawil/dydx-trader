export interface IHTTPError {
  status: number;
  message: string;
}

export class HTTPError implements IHTTPError {
  public message: string;
  public status: number;

  constructor(message: string, status = 500) {
    this.message = message;
    this.status = status;
  }
}
