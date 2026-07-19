import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import * as colors from 'colors';
import cors from 'cors';
import * as querystring from 'querystring';
import * as path from 'path';
import { parseScgPostAnswer } from './html-parser/list';
import { parseScgGetAnswer } from './html-parser/get';
import { suggest } from './suggest';
import { prepareUrl } from './urlPreparation';
import { collectDefaultMetrics, Counter, Histogram, register } from 'prom-client';
import { config } from '@tuktuk-scg-scrapper/common/config/scgProvider';
import { config as storageConfig } from '@tuktuk-scg-scrapper/common/config/storage';
import { parseGraph } from './html-parser/mtggoldfish';
import { logError } from '@tuktuk-scg-scrapper/common/logger';
import compression from 'compression';
import { version as pkgVersion } from './package.json';

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
        const name = String(req.query.name)
        // ó -> o
        .replace('ó', 'o')
        // í -> i
        .replace('í', 'i'); //.replace(/,/g, "%c%")
        const page = parseInt(String(req.query.page) || '', 10);
        const auto = req.query.auto === 'true';
        const queryObject: Record<string, string | number> = {
            pg: page || 1,
            hawkoutput: 'json',
        };
        if (auto) {
            queryObject.card_name = name;
        } else {
            queryObject.search_query = name;
        }

        const query = querystring.stringify(queryObject);
        console.log(`list request: name: ${queryObject.search_query || queryObject.card_name}, page: ${queryObject.pg}`);
        searchTotal.inc({ card_name: name });

        const searchScg = async (criteria: Record<string, unknown>) =>
            (await fetch(`https://essearchapi-na.hawksearch.com/api/v2/search`, {
                method: 'POST',
                body: JSON.stringify({
                    Variant: { MaxPerPage: 32 },
                    MaxPerPage: 32,
                    PageNo: page || 1,
                    clientguid: 'cc3be22005ef47d3969c3de28f09571b',
                    ...criteria,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })).json();

        // The card_name facet only matches the exact card name (case-sensitive),
        // so it fits autocompletion picks; free-form input goes through Keyword.
        let answer = auto ? await searchScg({ FacetSelections: { card_name: [name] } }) : null;
        if (!answer?.Results?.length) {
            answer = await searchScg({ Keyword: name });
        }
        const pagedAnswer = await parseScgPostAnswer(answer);

        fetch(`http://${storageConfig.host}:${storageConfig.port}/storage/card/update-ids`, {
            method: 'PUT',
            body: JSON.stringify({
                rows: pagedAnswer.rows,
            }),
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
        }).catch((e) => console.error(`Failed to dump: ${e}`));

        resp.status(200).send(pagedAnswer);
    } catch (e) {
        logError('/api/list request failed', e);
        return next(e);
    }
    next();
});

app.get('/api/get', async function (req, resp, next) {
    try {
        const name = String(req.query.name);
        const id = decodeURIComponent(name);
        const preparedName = id.replace(/[\/\\,\.']/g, '').replace(/\s+/g, '-');
        console.log(`get request: id: ${id}, scg_id: ${preparedName}`);

        const response = await fetch(`https://www.starcitygames.com/${preparedName}`);
        const cookies = (response.headers as any).getSetCookie().join(';');
        const answer = await response.text();
        const parsed = await parseScgGetAnswer(answer, cookies);
        resp.status(200).send(parsed);
    } catch (e) {
        logError('/api/get request failed', e);
        return next(e);
    }

    next();
});

app.get('/api/graph', async function (req, resp, next) {
    try {
        const name = decodeURIComponent(String(req.query.name || ''));
        const set = decodeURIComponent(String(req.query.set || ''));
        const sub = decodeURIComponent(String(req.query.sub || ''));
        const foil = req.query.foil === 'true';
        const res = await parseGraph({
            name,
            set,
            sub,
            foil,
        });
        resp.status(200).send(res);
    } catch (e) {
        logError('/api/graph request failed', e);
        return next(e);
    }

    next();
});

app.get('/api/suggest', async function (req, resp, next) {
    try {
        const name = String(req.query.name);
        const id = decodeURIComponent(name);
        const suggested = suggest(id);
        resp.status(200).send(suggested);
    } catch (e) {
        logError('/api/suggest request failed', e);
        return next(e);
    }
    next();
});

app.get('/api/version', async function (req, resp, next) {
    resp.status(200).send({
        version: pkgVersion,
        buildNumber: process.env.BUILD_NUMBER,
    });
    next();
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
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

const port = config.port;

const server = app.listen(port, function () {
    console.log(colors.cyan(`Scg provider is running at http://${config.host}:${port}`));
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
            logError('Failed to shutdown', err);
            process.exit(1);
        }

        process.exit(0);
    });
};
