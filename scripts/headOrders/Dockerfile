FROM node:10

WORKDIR /app

RUN npm install request-promise request

COPY cronRequests.js .

CMD [ "node", "ordenesPunta.js" ]