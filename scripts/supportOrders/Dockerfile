FROM node:10

WORKDIR /app

RUN npm install request-promise request

COPY supportOrders.js .

CMD [ "node", "supportOrders.js" ]