import isDocker from 'is-docker';

export const config = {
    host: isDocker() ? 'scg-provider' : 'localhost',
    port: 8082,
};
