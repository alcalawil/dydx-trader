import { IHTTPError } from './types';

class HTTPError implements IHTTPError {
  public message: string;
  public status: number;
  constructor(message: string, status = 500) {
    this.message = message;
    this.status = status;
  }
}

export default HTTPError;
