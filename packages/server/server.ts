import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as colors from 'colors';
import * as cors from 'cors';
import * as querystring from 'querystring';
import * as path from 'path';
import fetch from 'node-fetch';
import { parseScgListAnswer } from './html-parser/list';
import { parseScgGetAnswer } from './html-parser/get';
import { suggest } from './suggest';
import { prepareUrl } from './urlPreparation';
import { collectDefaultMetrics, Counter, Histogram, register } from 'prom-client';
const isDocker = require('is-docker');

collectDefaultMetrics();

const searchTotal = new Counter({
    name: 'search',
    help: 'Card search request',
    labelNames: ['card_name'],
});

const httpRequestDurationMicroseconds = new Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000, 1500, 2000, 5000, 10000], // buckets for response time from 0.1ms to 500ms
});

const compression = require('compression');
const app = express()
    .use(morgan(':method :url -> :status'))
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(cors());

app.use(compression({ threshold: 0 }));
app.use(express.static('../../dist'));

// Runs before each requests
app.use((req, res, next) => {
    res.locals.startEpoch = Date.now();
    next();
});

app.get('/api/list', async function (req, resp, next) {
    try {
        const name = String(req.query.name);
        const page = parseInt(String(req.query.page) || '', 10);
        const preparedName = prepareUrl(name);
        const queryObject = {
            search_query: preparedName,
            page: page || 1,
        };
        const query = querystring.stringify(queryObject);
        console.log(`list request: name: ${queryObject.search_query}, page: ${queryObject.page}`);

        searchTotal.inc({ card_name: name });

        const answer = await (await fetch(`https://starcitygames.com/search.php?${query}`)).text();
        const pagedAnswer = await parseScgListAnswer(answer);

        fetch(`http://${isDocker() ? 'storage' : 'localhost'}:8084/storage/card/update-ids`, {
            method: 'PUT',
            body: JSON.stringify({
                rows: pagedAnswer.rows,
            }),
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        });

        resp.status(200).send(pagedAnswer);
    } catch (e) {
        next(e);
    }
    next();
});

app.get('/api/get', async function (req, resp, next) {
    try {
        const name = String(req.query.name);
        const id = decodeURIComponent(name);
        const preparedName = id.replace(/[\/\\,\.']/g, '').replace(/\s+/g, '-');
        console.log(`get request: id: ${id}, scg_id: ${preparedName}`);

        const answer = await (await fetch(`https://www.starcitygames.com/${preparedName}`)).text();
        resp.status(200).send(await parseScgGetAnswer(answer));
    } catch (e) {
        next(e);
    }

    next();
});

app.get('/api/suggest', async function (req, resp, next) {
    try {
        const name = String(req.query.name);
        const id = decodeURIComponent(name);
        resp.status(200).send(suggest(id));
    } catch (e) {
        next(e);
    }
    next();
});

app.get('/api/version', async function (req, resp, next) {
    resp.status(200).send({
        version: require('./package.json').version,
        buildNumber: process.env.BUILD_NUMBER,
    });
    next();
});

app.get('/metrics', (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(register.metrics());
});

app.get(/^(\/card|\/$)/, function (req, resp, next) {
    resp.sendFile(path.join(__dirname, '../../dist/index.html'));
    next();
});

// Error handler
app.use((err, req, res, next) => {
    res.statusCode = 500;
    // Do not expose your error in production
    res.json({ error: err.message });
    next();
});

// Runs after each requests
app.use((req, res) => {
    const responseTimeInMs = Date.now() - res.locals.startEpoch;

    if (req.route) {
        httpRequestDurationMicroseconds
            .labels(req.method, req.route.path, res.statusCode.toString())
            .observe(responseTimeInMs);
    }
});

const port = 8082;

const server = app.listen(port, function () {
    console.log(colors.cyan(`Scg provider is running at http://localhost:${port}`));
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
