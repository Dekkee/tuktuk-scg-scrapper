import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as colors from 'colors';
import * as cors from 'cors';
import * as querystring from 'querystring';
import fetch from 'node-fetch';
import { parseScgListAnswer } from "./html-parser/list";
import { parseScgGetAnswer } from './html-parser/get';
import * as path from 'path';
import { suggest } from './suggest';

const compression = require('compression');
const app = express()
    .use(morgan(':method :url -> :status'))
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(cors());

app.use(compression({ threshold: 0 }));
app.use(express.static('dist'));

const pageSize = 25;

app.get('/api/list', async function (req, resp) {
    const query = querystring.stringify({
        name: req.query.name,
        numpage: pageSize,
        startnum: +req.query.page * pageSize || 0,
        auto: req.query.auto === 'true' ? 'Y' : 'N'
    });

    const answer = await (await fetch(`https://www.starcitygames.com/results?${query}`)).text();
    resp.status(200).send(parseScgListAnswer(answer));
});

app.get('/api/get', async function (req, resp) {
    const id = decodeURIComponent(req.query.name);

    const answer = await (await fetch(`https://www.starcitygames.com/catalog/magic_the_gathering/product/${id}`)).text();
    resp.status(200).send(parseScgGetAnswer(answer));
});

app.get('/api/suggest', async function (req, resp) {
    const id = decodeURIComponent(req.query.name);
    resp.status(200).send(suggest(id));
});

app.get('*', function (req, resp) {
    resp.sendFile(path.join(__dirname, '../../dist/index.html'));
});

const port = 8081;

app.listen(port, function () {
    console.log(colors.cyan(`Tuktuk server is running at http://localhost:${port}`));
});
