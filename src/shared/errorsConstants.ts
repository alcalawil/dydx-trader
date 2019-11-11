import { IHTTPError } from '../entities/types';
import { BAD_REQUEST, NOT_FOUND } from 'http-status-codes';

const ROUTE_NOT_FOUND: IHTTPError = {
  message: 'Route not found',
  status: NOT_FOUND
};

const BAD_PARAMS: IHTTPError = {
  message: 'Bad params',
  status: BAD_REQUEST
};

const ORDER_NOT_FOUND: IHTTPError = {
  message: 'Order not found with this id',
  status: BAD_REQUEST
};

const INVALID_SIGNATURE: IHTTPError = {
  message: 'Invalid signature!',
  status: BAD_REQUEST
};

const errorsConstants = {
  ROUTE_NOT_FOUND,
  BAD_PARAMS,
  ORDER_NOT_FOUND,
  INVALID_SIGNATURE
};

export default errorsConstants;
