FROM node:12-alpine

ADD package.json /tmp/package.json
ADD yarn.lock /tmp/yarn.lock
RUN cd /tmp && yarn --network-timeout 100000 && mkdir -p /app && cp -a /tmp/node_modules /app/

COPY . /app
WORKDIR /app

# RUN yarn test:ci

RUN yarn build
ENTRYPOINT [ "yarn", "start" ]
