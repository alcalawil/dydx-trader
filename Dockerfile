# --- Installing stage
FROM node:10 AS installer

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# ---

# Building stage
FROM installer AS builder

## Workdir is shared between the stage so let's reuse it as we neeed the packages
WORKDIR /usr/src/app

COPY ./src src
COPY tsconfig.json .
COPY ./util  /usr/src/app/util
RUN npm run build

# ---

# Running code under slim image (production part mostly)
FROM node:10

## Clean new directory  
WORKDIR /app

## We just need the build and package to execute the command
COPY --from=builder /usr/src/app/dist /app/dist

COPY package*.json /app/

RUN npm install --production

USER node

CMD [ "node", "-r", "module-alias/register", "./dist/start.js" ]