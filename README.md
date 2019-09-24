# dydx market maker bot

This is a market maker bot made in typescript to increase liquidity and earn spreads profits in dydx exchange

### Start market maker bot

- `npm i`
- `npm start`

### Start support orders

- `npm run support-orders`

### Start head orders

- `npm run head-orders`


### Docker

- `docker build -t dydx-mm:0.0.1 .`
- `docker run --env-file ./.env -p 3000:3000 dydx-mm:0.0.1`

### TODO

 - Return bid/ask on a single endpoint