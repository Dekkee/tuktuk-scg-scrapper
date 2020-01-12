# Build frontend
FROM node:12-alpine as front

WORKDIR /home/app
ENV NODE_ENV=production
RUN apk update && apk upgrade && apk add --no-cache bash git openssh

COPY package.json yarn.lock lerna.json /home/app/
COPY packages/frontend/package.json /home/app/packages/frontend/
COPY packages/common/package.json /home/app/packages/common/

# install with dev deps
RUN yarn install --production=false --frozen-lockfile

COPY ./svg.d.ts /home/app/
COPY ./tsconfig.json /home/app/
COPY packages/frontend /home/app/packages/frontend/
COPY packages/common /home/app/packages/common/

RUN yarn workspace @tuktuk-scg-scrapper/frontend build

FROM node:12-alpine

WORKDIR /home/app
ENV NODE_ENV=production
RUN apk update && apk upgrade && apk add --no-cache bash git openssh

COPY package.json yarn.lock tsconfig.json /home/app/
COPY packages/server/package.json /home/app/packages/server/
COPY packages/common/package.json /home/app/packages/common/

RUN yarn install --frozen-lockfile

COPY --from=front /home/app/dist /home/app/dist/
COPY packages/common/ /home/app/packages/common/
COPY packages/server/ /home/app/packages/server/

ARG TEAMCITY_BUILD_NUMBER
ENV BUILD_NUMBER=$TEAMCITY_BUILD_NUMBER

WORKDIR /home/app/packages/server

ENTRYPOINT [ "node", "-r", "ts-node/register", "server.ts" ]
EXPOSE 8081
