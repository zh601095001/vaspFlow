# syntax=docker/dockerfile:1
FROM node:16.17-alpine
RUN apk add --update  --no-cache python3 g++ make
WORKDIR /app/backend/server
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
