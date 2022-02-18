## relay-dapp dockerfile (This file is called Dockerfile) on server side. ##
FROM node:12-alpine AS compiler
RUN apk add --no-cache build-base git bash
WORKDIR /usr/src/app
COPY . ./
RUN npm i
RUN npm start
