const isDocker = require("is-docker")();

export const config = {
  host: isDocker ? 'proxy' : 'localhost',
  port: 8081
}
