# Build frontend
FROM node:16-alpine as front

WORKDIR /home/app
ENV NODE_ENV=production
RUN apk update && apk upgrade && apk add --no-cache bash git openssh

COPY package.json yarn.lock lerna.json /home/app/
COPY packages/frontend/package.json /home/app/packages/frontend/
COPY packages/common/package.json /home/app/packages/common/

# install with dev deps
RUN yarn install --production=false --frozen-lockfile --network-concurrency 1

COPY ./svg.d.ts /home/app/
COPY ./tsconfig.json /home/app/
COPY packages/frontend /home/app/packages/frontend/
COPY packages/common /home/app/packages/common/

RUN yarn workspace @tuktuk-scg-scrapper/frontend build

FROM node:16-alpine

WORKDIR /home/app
ENV NODE_ENV=production

COPY package.json tsconfig.json /home/app/

COPY packages/frontend /home/app/packages/frontend/
COPY packages/common /home/app/packages/common/
RUN yarn install --production=true --frozen-lockfile --network-concurrency 1 && yarn cache clean

COPY --from=front /home/app/dist /home/app/dist/

ARG TEAMCITY_BUILD_NUMBER
ENV BUILD_NUMBER=$TEAMCITY_BUILD_NUMBER

WORKDIR /home/app/packages/frontend

ENTRYPOINT [ "node", "-r", "ts-node/register", "server.ts" ]
EXPOSE 8083
