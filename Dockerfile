# Build frontend
FROM node:12-alpine as front

WORKDIR /home/app
ENV NODE_ENV=production

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

# Build server
FROM node:12-alpine as server

WORKDIR /home/app
ENV NODE_ENV=production

COPY package.json yarn.lock lerna.json /home/app/
COPY packages/server/package.json /home/app/packages/server/
COPY packages/common/package.json /home/app/packages/common/

# install with dev deps
RUN yarn install --production=false --frozen-lockfile

COPY ./tsconfig.json /home/app/
COPY packages/server /home/app/packages/server/
COPY packages/common /home/app/packages/common/

RUN yarn workspace @tuktuk-scg-scrapper/server build

FROM node:12-alpine

WORKDIR /home/app
ENV NODE_ENV=production

COPY package.json yarn.lock lerna.json /home/app/
COPY packages/server/package.json /home/app/packages/server/
COPY packages/common/package.json /home/app/packages/common/

RUN yarn install --frozen-lockfile

COPY --from=front /home/app/dist /home/app/dist/
COPY --from=server /home/app/packages/server/dist /home/app/
COPY --from=server /home/app/packages/server/data /home/app/data/

ENTRYPOINT [ "node", "server.js" ]
EXPOSE 8081
