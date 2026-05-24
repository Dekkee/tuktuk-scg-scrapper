import isDocker from 'is-docker';

export const config = {
  host: isDocker() ? 'frontend' : 'localhost',
  port: 8083
}
