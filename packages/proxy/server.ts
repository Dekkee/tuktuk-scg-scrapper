import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as colors from 'colors';
import * as cors from 'cors';
import * as httpProxy from 'http-proxy';
const isDocker = require("is-docker")();

const compression = require('compression');
const app = express()
    .use(morgan(':method :url -> :status'))
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(cors());

const proxy = httpProxy.createProxyServer({ forward: `http://${isDocker ? 'scg-provider' : 'localhost'}:8082` });

app.use(compression({ threshold: 0 }));
app.use(express.static('../../dist'));

// Runs before each requests
app.use((req, res, next) => {
    res.locals.startEpoch = Date.now();
    next();
});

app.get('/api/*', (req, res) => {
  proxy.web(req, res, { target: `http://${isDocker ? 'scg-provider' : 'localhost'}:8082` });
});

app.get('/storage/*', (req, res) => {
    proxy.web(req, res, { target: `http://${isDocker ? 'storage' : 'localhost'}:8084` });
});

app.get('/*', (req, res) => {
    proxy.web(req, res, { target: `http://${isDocker ? 'frontend' : 'localhost'}:8083` });
});

const port = 8081;

const server = app.listen(port, function () {
    console.log(colors.cyan(`Proxy is running at http://localhost:${port}`));
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
