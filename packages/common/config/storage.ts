import isDocker from 'is-docker';

export const config = {
    host: isDocker() ? 'storage' : 'localhost',
    port: 8084,
};
