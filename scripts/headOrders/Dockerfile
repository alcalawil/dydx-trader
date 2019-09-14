FROM node:10

WORKDIR /app

RUN npm install request-promise request

COPY ordenesPunta.js .

CMD [ "node", "ordenesPunta.js" ]