# Build frontend
FROM node:22-alpine as front

WORKDIR /home/app
ENV NODE_ENV=production
RUN apk update && apk upgrade && apk add --no-cache bash git openssh

COPY package.json package-lock.json /home/app/
COPY packages/frontend/package.json /home/app/packages/frontend/
COPY packages/common/package.json /home/app/packages/common/

# install with dev deps
RUN npm ci --include=dev

COPY ./svg.d.ts /home/app/
COPY ./tsconfig.json /home/app/
COPY packages/frontend /home/app/packages/frontend/
COPY packages/common /home/app/packages/common/

RUN npm run build --workspace=@tuktuk-scg-scrapper/frontend

FROM node:22-alpine

WORKDIR /home/app
ENV NODE_ENV=production

COPY package.json package-lock.json tsconfig.json /home/app/

COPY packages/frontend /home/app/packages/frontend/
COPY packages/common /home/app/packages/common/
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=front /home/app/dist /home/app/dist/

ARG TEAMCITY_BUILD_NUMBER
ENV BUILD_NUMBER=$TEAMCITY_BUILD_NUMBER

WORKDIR /home/app/packages/frontend

ENTRYPOINT [ "node", "-r", "ts-node/register", "server.ts" ]
EXPOSE 8083
