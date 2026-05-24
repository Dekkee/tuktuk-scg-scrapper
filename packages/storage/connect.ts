import mongoose from 'mongoose';
import { mongoConnectionString } from '@tuktuk-scg-scrapper/common/config/mongo';
import { logError } from '@tuktuk-scg-scrapper/common/logger';

export const connect = () => {
    return mongoose
        .connect(mongoConnectionString, {
            connectTimeoutMS: 10000,
        })
        .then(() => {
            // mongoose.connection.on('disconnected', connect);
            return console.info(`Successfully connected to cards`);
        })
        .catch((error) => {
            logError('Error connecting to database: ', error);
            // return process.exit(1)
        });
};

export const disconnect = () => mongoose.disconnect();
