import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as colors from 'colors';
import * as path from 'path';
import * as cors from 'cors';
import { config } from '@tuktuk-scg-scrapper/common/config/frontend';

const compression = require('compression');
const app = express()
    .use(morgan(':method :url -> :status'))
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(cors());

app.use(compression({ threshold: 0 }));
app.use(express.static('../../dist'));

app.get(/^(\/card|\/$)/, function (req, resp, next) {
    resp.sendFile(path.join(__dirname, '../../dist/index.html'));
    next();
});

const port = config.port;

const server = app.listen(port, function () {
    console.log(colors.cyan(`Frontend http://${config.host}:${port}`));
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
