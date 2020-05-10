const isDocker = require("is-docker")();

export const config = {
  host: isDocker ? 'storage' : 'localhost',
  port: 8084
}
