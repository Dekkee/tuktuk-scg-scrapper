FROM node:14-alpine

WORKDIR /home/app
ENV NODE_ENV=production
RUN apk update && apk upgrade && apk add --no-cache bash git openssh

COPY package.json package-lock.json tsconfig.json /home/app/
COPY packages/server/package.json /home/app/packages/server/
COPY packages/common/package.json /home/app/packages/common/

RUN npm ci && npm cache clean --force

COPY packages/common/ /home/app/packages/common/
COPY packages/server/ /home/app/packages/server/

ARG TEAMCITY_BUILD_NUMBER
ENV BUILD_NUMBER=$TEAMCITY_BUILD_NUMBER

WORKDIR /home/app/packages/server

ENTRYPOINT [ "node", "-r", "ts-node/register", "server.ts" ]
EXPOSE 8082
