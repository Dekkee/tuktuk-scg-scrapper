# Install server production deps
FROM node:12-alpine as server-deps

WORKDIR /home/app
ENV NODE_ENV=production
RUN apk update && apk upgrade && apk add --no-cache bash git openssh

COPY package.json yarn.lock tsconfig.json /home/app/
COPY packages/storage/package.json /home/app/packages/storage/
COPY packages/common/package.json /home/app/packages/common/

RUN yarn install --frozen-lockfile

FROM node:12-alpine

WORKDIR /home/app
ENV NODE_ENV=production

COPY package.json tsconfig.json /home/app/

COPY packages/common/ /home/app/packages/common/
COPY packages/storage/ /home/app/packages/storage/
COPY --from=server-deps /home/app/node_modules/ /home/app/node_modules/

ARG TEAMCITY_BUILD_NUMBER
ENV BUILD_NUMBER=$TEAMCITY_BUILD_NUMBER

WORKDIR /home/app/packages/storage

ENTRYPOINT [ "node", "-r", "ts-node/register", "server.ts" ]
EXPOSE 8084
