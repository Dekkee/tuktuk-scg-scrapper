FROM node:24-alpine AS build

WORKDIR /home/app

COPY package.json package-lock.json tsconfig.json tsconfig.docker.json /home/app/
COPY packages/proxy/package.json /home/app/packages/proxy/
COPY packages/server/package.json /home/app/packages/server/
COPY packages/storage/package.json /home/app/packages/storage/
COPY packages/frontend/package.json /home/app/packages/frontend/
COPY packages/common/package.json /home/app/packages/common/

RUN npm ci --include=dev

COPY packages/common/ /home/app/packages/common/
COPY packages/server/ /home/app/packages/server/

RUN npx tsc -p tsconfig.docker.json

FROM node:24-alpine

WORKDIR /home/app
ENV NODE_ENV=production
RUN apk update && apk upgrade && apk add --no-cache bash git openssh

COPY package.json package-lock.json /home/app/
COPY packages/proxy/package.json /home/app/packages/proxy/
COPY packages/server/package.json /home/app/packages/server/
COPY packages/storage/package.json /home/app/packages/storage/
COPY packages/frontend/package.json /home/app/packages/frontend/
COPY packages/common/package.json /home/app/packages/common/

RUN npm ci && npm cache clean --force

COPY --from=build /home/app/build/docker/packages/common/ /home/app/packages/common/
COPY --from=build /home/app/build/docker/packages/server/ /home/app/packages/server/

ARG BUILD_NUMBER=local
ENV BUILD_NUMBER=$BUILD_NUMBER

WORKDIR /home/app/packages/server

ENTRYPOINT [ "node", "server.js" ]
EXPOSE 8082
