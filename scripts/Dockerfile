FROM node:10

WORKDIR /app

RUN npm install request-promise request

COPY cronRequests.js /app/

COPY entrypoint.sh /app/

RUN ["chmod","+x","/app/entrypoint.sh"]

ENTRYPOINT ["/app/entrypoint.sh"]