# syntax=docker/dockerfile:1
FROM node:16.17-alpine
RUN apk add --update --no-cache python3 g++ make curl
WORKDIR /app/front
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
