FROM node:10

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY dist /app/dist

EXPOSE 3000

CMD [ "npm", "run", "start-docker" ]