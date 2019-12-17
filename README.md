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
- `docker run --name dydx_trade_ops --init -it -d --env-file ./.env -p 3000:3000 dydx-mm:0.0.1`

### REST Client

```
# Get account balances
curl --request GET \
  --url http://localhost:3000/api/funds/balances \
  --header 'api-key: your_api_key'
```

### TODO

 - Move a API code to ./src/API