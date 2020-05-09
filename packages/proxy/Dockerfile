# Install server production deps
FROM node:12-alpine as proxy-deps

WORKDIR /home/app
ENV NODE_ENV=production
RUN apk update && apk upgrade && apk add --no-cache bash git openssh

COPY package.json yarn.lock tsconfig.json /home/app/
COPY packages/proxy/package.json /home/app/packages/proxy/
COPY packages/common/package.json /home/app/packages/common/

RUN yarn install --frozen-lockfile

FROM node:12-alpine

WORKDIR /home/app
ENV NODE_ENV=production

COPY package.json tsconfig.json /home/app/

COPY packages/common/ /home/app/packages/common/
COPY packages/proxy/ /home/app/packages/proxy/
COPY --from=proxy-deps /home/app/node_modules/ /home/app/node_modules/

ARG TEAMCITY_BUILD_NUMBER
ENV BUILD_NUMBER=$TEAMCITY_BUILD_NUMBER

WORKDIR /home/app/packages/proxy

ENTRYPOINT [ "node", "-r", "ts-node/register", "server.ts" ]
EXPOSE 8081
