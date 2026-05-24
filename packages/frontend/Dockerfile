# Build frontend
FROM node:24-alpine AS front

WORKDIR /home/app
ENV NODE_ENV=production
RUN apk update && apk upgrade && apk add --no-cache bash git openssh

COPY package.json package-lock.json /home/app/
COPY packages/proxy/package.json /home/app/packages/proxy/
COPY packages/server/package.json /home/app/packages/server/
COPY packages/storage/package.json /home/app/packages/storage/
COPY packages/frontend/package.json /home/app/packages/frontend/
COPY packages/common/package.json /home/app/packages/common/

# install with dev deps
RUN npm ci --include=dev

COPY ./svg.d.ts /home/app/
COPY ./tsconfig.json /home/app/
COPY packages/frontend /home/app/packages/frontend/
COPY packages/common /home/app/packages/common/

RUN npm run build --workspace=@tuktuk-scg-scrapper/frontend

FROM node:24-alpine

WORKDIR /home/app
ENV NODE_ENV=production

COPY package.json package-lock.json tsconfig.json /home/app/
COPY packages/proxy/package.json /home/app/packages/proxy/
COPY packages/server/package.json /home/app/packages/server/
COPY packages/storage/package.json /home/app/packages/storage/
COPY packages/frontend/package.json /home/app/packages/frontend/
COPY packages/common/package.json /home/app/packages/common/

RUN npm ci --omit=dev && npm cache clean --force

COPY packages/frontend /home/app/packages/frontend/
COPY packages/common /home/app/packages/common/
COPY --from=front /home/app/dist /home/app/dist/

ARG BUILD_NUMBER=local
ENV BUILD_NUMBER=$BUILD_NUMBER

WORKDIR /home/app/packages/frontend

ENTRYPOINT [ "node", "-r", "ts-node/register", "server.ts" ]
EXPOSE 8083
