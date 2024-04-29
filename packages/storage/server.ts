import { Application } from 'express';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { connect } from './connect';
import { cardRoute } from './routes/card';
import * as morgan from 'morgan';
import * as colors from 'colors';
import { config } from '@tuktuk-scg-scrapper/common/config/storage';
import { stopCronJobs } from './maintenance/scheduler';
import { logError } from '@tuktuk-scg-scrapper/common/logger';

let server;
const port = config.port;
const app: Application = express();

const runApp = async () => {
    try {
        await connect();

        app.use(bodyParser.json());
        app.use(morgan(':method :url -> :status'));
        cardRoute({ app });

        server = app.listen(port, () => console.log(`Application started successfully on port ${port}.`));

        process.on('SIGINT', function onSigint() {
            console.log(colors.cyan(`SIGINT received`));
            shutdown(server);
        });

        process.on('SIGTERM', function onSigterm() {
            console.log(colors.cyan(`SIGTERM received`));
            shutdown(server);
        });
    } finally {
    }
};
runApp();

const shutdown = function (server) {
    console.log(colors.cyan(`Shutting down server`));

    server.close((err) => {
        if (err) {
            logError('Failed to shutdown', err);
            process.exit(1);
        }

        process.exit(0);
    });

    stopCronJobs();
};
