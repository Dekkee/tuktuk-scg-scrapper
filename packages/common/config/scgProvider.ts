const isDocker = require("is-docker")();

export const config = {
  host: isDocker ? 'scg-provider' : 'localhost',
  port: 8082
}
