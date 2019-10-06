FROM node:12-alpine

ADD package.json /tmp/package.json
ADD yarn.lock /tmp/yarn.lock
RUN cd /tmp && yarn && mkdir -p /app && cp -a /tmp/node_modules /app/

COPY . /app
WORKDIR /app

# RUN yarn test:ci

RUN yarn update-index
RUN yarn build
ENTRYPOINT [ "yarn", "start" ]
