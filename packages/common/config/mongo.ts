const isDocker = require("is-docker")();

export const mongoDb = {
  user: process.env.MONGO_INITDB_ROOT_USERNAME || 'root',
  password: process.env.MONGO_INITDB_ROOT_PASSWORD || 'example',
  host: isDocker ? 'mongo' : 'localhost',
  port: 27017,
  dbName: 'cards',
};

export const mongoConnectionString = `mongodb://${mongoDb.user}:${mongoDb.password}@${mongoDb.host}:${mongoDb.port}/${mongoDb.dbName}?authSource=admin`;
