export const STRATEGY_BUY_ORDER_ATTEMPT = '10000I';
// Estrategia envía orden de compra - Intento
export const STRATEGY_BUY_ORDER_COMPLETED = '10000C';
// Estrategia envía orden de compra - Completada
export const STRATEGY_BUY_ORDER_ERROR = '10000E';
// Estrategia envía orden de compra - Error
export const STRATEGY_SELL_ORDER_ATTEMPT = '10001I';
// Estrategia envía orden de venta - Intento
export const STRATEGY_SELL_ORDER_COMPLETED = '10001C';
// Estrategia envía orden de venta - Completada
export const STRATEGY_SELL_ORDER_ERROR = '10001E';
// Estrategia envía orden de venta - Error
export const STRATEGY_REQUEST_ORDER_STATUS = '10002';
// Estrategia consulta estado de una orden
export const STRATEGY_REQUEST_ML_MODEL = '10003';
// Estrategia consulta modelo de ML
export const STRATEGY_CYCLE_STARTED = '10004';
// Estrategia comienza cycle
export const STRATEGY_CYLCE_CLOSED = '10005';
// Estrategia cierra cycle
export const STRATEGY_CANCEL_ORDER_ATTEMPT = '10006';
// Estrategia cancela orden - Intento
export const STRATEGY_CANCEL_ORDER_COMPLETED = '10007';
// Estrategia cancela orden - Completada
export const STRATEGY_CANCEL_ORDER_ERROR = '10008';
// Estrategia cancela order - Error
export const STRATEGY_CANCEL_ALL_ORDERS_ATTEMPT = '10009';
// Estrategia cancela todas las ordenes - Intento
export const STRATEGY_CANCEL_ALL_ORDERS_COMPLETED = '10010';
// Estrategia cancela todas las ordenes - Completada
export const STRATEGY_CANCEL_ALL_ORDERS_ERROR = '10011';
// Estrategia cancela todas las ordenes - Error
export const STRATEGY_REQUEST_BALANCE_ATTEMPT = '10012I';
// Estrategia consulta balance - Intento
export const STRATEGY_REQUEST_BALANCE_COMPLETED = '10012C';
// Estrategia consulta balance - Completada
export const STRATEGY_REQUEST_BALANCE_ERROR = '10012E';
// Estrategia consulta balance - Error


export const TRADER_SEND_BUY_ORDER = '20000';
// Trader envía orden de compra
export const TRADER_SEND_SELL_ORDER = '20001';
// Trader envía orden de venta
export const TRADER_SEND_CANCEL_ORDER = '20002';
// Trader envía orden de cancelación
export const TRADER_REQUEST_ORDER_STATUS = '20003';
// Trader consulta estado de una orden
export const TRADER_REQUEST_ORDER_STATUS_ERROR = '20004';
// Trader consulta estado de una orden
export const TRADER_REQUEST_BALANCE = '20005';
// Trader consulta estado de una orden
export const TRADER_REQUEST_BALANCE_ERROR = '20006';
// Trader consulta estado de una orden

// Genéricos
export const SQS_MSJ_RECEIVED = '30000';
// Componente recibe mensaje SQS (puede ser genérico a cualquier componente)
export const SQS_MSJ_SENT = '30001';
// Componente envía mensaje SQS
export const CACHE_UPDATED = '30002';
// Componente actualiza cache
export const TRADER_STARTED = '30003';
// Componente inicia
export const PING = '30004';
// Componente ping
export const ERROR = '30005';
// Componente error
export const SET_NEW_ORDER_IN_STATE = '30006';
// Componente inserta orden en el state;
export const STATE_UPDATED = '30007';
// Componente actualiza state
export const GET_ADDRESS = '30008';
// Componente solicita wallet almacenada secret manager
export const GET_PRIVATE_KEY = '30009';
// Componente solicita private key de la wallet almacenada en secret manager
