import { ILogType } from '@entities';

export const STRATEGY_BUY_ORDER_ATTEMPT: ILogType = {
  codeType: '10000I',
  action: 'Intento de posteo de orden de compra.',
  logLevel: 'debug',
  debugLogLevel: '4'
};
// Estrategia envía orden de compra - Intento

export const STRATEGY_BUY_ORDER_COMPLETED: ILogType = {
  codeType: '10000C',
  action: 'Posteo de orden de compra completado.',
  logLevel: 'debug',
  debugLogLevel: '1'
};
// Estrategia envía orden de compra - Completada

export const STRATEGY_BUY_ORDER_ERROR: ILogType = {
  codeType: '10000I',
  action: 'Error al intentar postear la orden de compra',
  logLevel: 'error',
  debugLogLevel: '1'
};
// Estrategia envía orden de compra - Error

export const STRATEGY_SELL_ORDER_ATTEMPT: ILogType = {
  codeType: '10001I',
  action: 'Intento de posteo de orden de venta.',
  logLevel: 'debug',
  debugLogLevel: '4'
};
// Estrategia envía orden de venta - Intento

export const STRATEGY_SELL_ORDER_COMPLETED: ILogType = {
  codeType: '10001C',
  action: 'Posteo de orden de venta completada.',
  logLevel: 'debug',
  debugLogLevel: '1'
};
// Estrategia envía orden de venta - Completada

export const STRATEGY_SELL_ORDER_ERROR: ILogType = {
  codeType: '10001E',
  action: 'Error al intentar postear la orden de venta.',
  logLevel: 'error',
  debugLogLevel: '1'
};
// Estrategia envía orden de venta - Error

export const STRATEGY_REQUEST_ORDER_STATUS: ILogType = {
  codeType: '10002',
  action: 'Consultar status de la orden.',
  logLevel: 'debug',
  debugLogLevel: '1'
};
// Estrategia consulta estado de una orden

export const STRATEGY_REQUEST_ML_MODEL: ILogType = {
  codeType: '10003',
  action: 'Constulta del modelo de ML.',
  logLevel: 'debug',
  debugLogLevel: '2'
};
// Estrategia consulta modelo de ML

export const STRATEGY_CYCLE_STARTED: ILogType = {
  codeType: '10004',
  action: 'Ciclo iniciado',
  logLevel: 'debug',
  debugLogLevel: '2'
};
// Estrategia comienza cycle

export const STRATEGY_CYLCE_CLOSED: ILogType = {
  codeType: '10005',
  action: 'Ciclo detenido',
  logLevel: 'debug',
  debugLogLevel: '2'
};
// Estrategia cierra cycle

export const STRATEGY_CANCEL_ORDER_ATTEMPT: ILogType = {
  codeType: '10006I',
  action: 'Intentando cancelar orden.',
  logLevel: 'debug',
  debugLogLevel: '4'
};
// Estrategia cancela orden - Intento

export const STRATEGY_CANCEL_ORDER_COMPLETED: ILogType = {
  codeType: '10006C',
  action: 'Cancelacion de orden completada.',
  logLevel: 'debug',
  debugLogLevel: '1'
};
// Estrategia cancela orden - Completada

export const STRATEGY_CANCEL_ORDER_ERROR: ILogType = {
  codeType: '10006E',
  action: 'Error al cancelar orden.',
  logLevel: 'error',
  debugLogLevel: '1'
};
// Estrategia cancela order - Error

export const STRATEGY_CANCEL_ALL_ORDERS_ATTEMPT: ILogType = {
  codeType: '10007I',
  action: 'Intentando cancelar todas las ordenes.',
  logLevel: 'debug',
  debugLogLevel: '4'
};
// Estrategia cancela todas las ordenes - Intento

export const STRATEGY_CANCEL_ALL_ORDERS_COMPLETED: ILogType = {
  codeType: '10008C',
  action: 'Cancelacion de todas las ordenes completada.',
  logLevel: 'debug',
  debugLogLevel: '1'
};
// Estrategia cancela todas las ordenes - Completada

export const STRATEGY_CANCEL_ALL_ORDERS_ERROR: ILogType = {
  codeType: '10008E',
  action: 'Error al cancelar todas las ordenes',
  logLevel: 'error',
  debugLogLevel: '1'
};
// Estrategia cancela todas las ordenes - Error

export const STRATEGY_REQUEST_BALANCE_ATTEMPT: ILogType = {
  codeType: '10009I',
  action: 'Intentando obtener balances.',
  logLevel: 'debug',
  debugLogLevel: '4'
};
// Estrategia consulta balance - Intento

export const STRATEGY_REQUEST_BALANCE_COMPLETED: ILogType = {
  codeType: '10009C',
  action: 'Proceso para obtener balances completado.',
  logLevel: 'debug',
  debugLogLevel: '1'
};
// Estrategia consulta balance - Completada

export const STRATEGY_REQUEST_BALANCE_ERROR: ILogType = {
  codeType: '10009E',
  action: 'Error al obtener balances.',
  logLevel: 'error',
  debugLogLevel: '1'
};
// Estrategia consulta balance - Error


export const TRADER_SEND_BUY_ORDER: ILogType = {
  codeType: '20000',
  action: 'Orden de compra enviada',
  logLevel: 'debug',
  debugLogLevel: '2'
};
// Trader envía orden de compra

export const TRADER_SEND_SELL_ORDER: ILogType = {
  codeType: '20001',
  action: 'Orden de venta enviada',
  logLevel: 'debug',
  debugLogLevel: '2'
};
// Trader envía orden de venta

export const TRADER_SEND_CANCEL_ORDER: ILogType = {
  codeType: '20002',
  action: 'Cancelacion de orden enviada',
  logLevel: 'debug',
  debugLogLevel: '2'
};
// Trader envía orden de cancelación

export const TRADER_ORDER_STATUS_CHANGES: ILogType = {
  codeType: '20003',
  action: 'Detactado cambio de status de una orden.',
  logLevel: 'debug',
  debugLogLevel: '1'
};
// Trader consulta estado de una orden

export const TRADER_ORDER_STATUS_CHANGES_ERROR: ILogType = {
  codeType: '20004',
  action: 'Error consultando status de la orden.',
  logLevel: 'error',
  debugLogLevel: '1'
};
// Trader consulta estado de una orden

export const TRADER_REQUEST_BALANCE: ILogType = {
  codeType: '20005',
  action: 'Consultando balance.',
  logLevel: 'debug',
  debugLogLevel: '5'
};
// Trader consulta estado de una orden

export const TRADER_REQUEST_BALANCE_ERROR: ILogType = {
  codeType: '20006',
  action: 'Error consultando balance.',
  logLevel: 'error',
  debugLogLevel: '1'
};
// Trader consulta estado de una orden

// Genéricos
export const SQS_MSJ_RECEIVED: ILogType = {
  codeType: '30000',
  action: 'Mensaje recibido.',
  logLevel: 'debug',
  debugLogLevel: '2'
};
// Componente recibe mensaje SQS (puede ser genérico a cualquier componente)

export const SQS_MSJ_SENT: ILogType = {
  codeType: '30001',
  action: 'Mensaje enviado.',
  logLevel: 'debug',
  debugLogLevel: '3'
};
// Componente envía mensaje SQS

export const CACHE_UPDATED: ILogType = {
  codeType: '30002',
  action: 'Cache actualizado.',
  logLevel: 'debug',
  debugLogLevel: '5'
};
// Componente actualiza cache

export const TRADER_STARTED: ILogType = {
  codeType: '30003',
  action: 'Trader iniciado.',
  logLevel: 'debug',
  debugLogLevel: '1'
};
// Componente inicia

export const PING = '30004';
// Componente ping

export const ERROR: ILogType = {
  codeType: '30005',
  action: 'Error no especificado.',
  logLevel: 'error',
  debugLogLevel: '1'
};
// Componente error

export const SET_NEW_ORDER_IN_STATE: ILogType = {
  codeType: '30006',
  action: 'Guardando nueva orden en el estado.',
  logLevel: 'debug',
  debugLogLevel: '5'
};
// Componente inserta orden en el state;

export const UPDATE_ORDER_IN_STATE: ILogType = {
  codeType: '30010',
  action: 'Actualizando orden en el estado.',
  logLevel: 'debug',
  debugLogLevel: '5'
};
// Componente inserta orden en el state;

export const STATE_UPDATED: ILogType = {
  codeType: '30007',
  action: 'State actualizado',
  logLevel: 'debug',
  debugLogLevel: '5'
};
// Componente actualiza state

export const GET_ADDRESS: ILogType = {
  codeType: '30008',
  action: 'Consutando wallet.',
  logLevel: 'debug',
  debugLogLevel: '2'
};
// Componente solicita wallet almacenada secret manager

export const GET_PRIVATE_KEY: ILogType = {
  codeType: '30009',
  action: 'Consultando private key.',
  logLevel: 'debug',
  debugLogLevel: '2'
};
// Componente solicita private key de la wallet almacenada en secret manager
