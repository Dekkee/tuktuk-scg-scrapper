FROM node:10-alpine

ADD package.json /tmp/package.json
ADD package-lock.json /tmp/package-lock.json
RUN cd /tmp && npm ci && mkdir -p /app && cp -a /tmp/node_modules /app/

COPY . /app
WORKDIR /app

RUN npm run build
ENTRYPOINT [ "yarn", "start" ]
