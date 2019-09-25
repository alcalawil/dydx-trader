FROM node:10

WORKDIR /app

RUN npm install request-promise request

COPY headOrders.js .

CMD [ "node", "headOrders.js" ]