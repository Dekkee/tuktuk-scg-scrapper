import * as mongoose from 'mongoose';
const isDocker = require("is-docker")();

export const connect = () => {
    return mongoose
        .connect(`mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME || 'root'}:${process.env.MONGO_INITDB_ROOT_PASSWORD || 'example'}@${isDocker ? 'mongo' : 'localhost'}:27017/cards?authSource=admin`, {
            useNewUrlParser: true,
            connectTimeoutMS: 10000,
            useFindAndModify: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            // mongoose.connection.on('disconnected', connect);
            return console.info(`Successfully connected to cards`);
        })
        .catch(error => {
            console.error('Error connecting to database: ', error);
            return process.exit(1);
        });
};

export const disconnect = () => mongoose.disconnect();
