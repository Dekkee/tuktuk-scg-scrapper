import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import * as colors from 'colors';
import cors from 'cors';
import proxy from 'express-http-proxy';
import { config } from '@tuktuk-scg-scrapper/common/config/proxy';
import { config as scgProviderConfig } from '@tuktuk-scg-scrapper/common/config/scgProvider';
import { config as frontendConfig } from '@tuktuk-scg-scrapper/common/config/frontend';
import { config as storageConfig } from '@tuktuk-scg-scrapper/common/config/storage';

const compression = require('compression');
const app = express()
    .use(morgan(':method :url -> :status ":referrer" :remote-addr'))
    .use(bodyParser.urlencoded({ extended: true }))
    .use(cors());

app.enable("trust proxy");

app.use(compression({ threshold: 0 }));
app.use(express.static('../../dist'));

// Runs before each requests
app.use((req, res, next) => {
    res.locals.startEpoch = Date.now();
    next();
});

app.get('/api/*splat', proxy(`http://${scgProviderConfig.host}:${scgProviderConfig.port}`));

app.get('/metrics/*splat',  proxy(`http://${scgProviderConfig.host}:${scgProviderConfig.port}`));

app.get('/metrics', proxy(`http://${scgProviderConfig.host}:${scgProviderConfig.port}`));

app.get('/storage/*splat',  proxy(`http://${storageConfig.host}:${storageConfig.port}`));

app.put(
    '/storage/*splat',
    (req, res, next) => {
        // todo: check cookie
        next();
    },
    proxy(`http://${storageConfig.host}:${storageConfig.port}`),
);

app.get('/*splat', proxy(`http://${frontendConfig.host}:${frontendConfig.port}`));

const port = config.port;

const server = app.listen(port, function () {
    console.log(colors.cyan(`Proxy is running at http://${config.host}:${port}`));
});

process.on('SIGINT', function onSigint() {
    console.log(colors.cyan(`SIGINT received`));
    shutdown();
});

process.on('SIGTERM', function onSigterm() {
    console.log(colors.cyan(`SIGTERM received`));
    shutdown();
});

const shutdown = function () {
    console.log(colors.cyan(`Shutting down server`));

    server.close((err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        process.exit(0);
    });
};
