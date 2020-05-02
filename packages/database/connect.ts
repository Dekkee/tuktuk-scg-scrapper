import * as mongoose from 'mongoose';

export const connect = () => {
    return mongoose
        .connect('mongodb://root:example@localhost:27017/cards?authSource=admin', {
            useNewUrlParser: true,
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 500,
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
