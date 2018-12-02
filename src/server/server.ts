import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as colors from 'colors';
import * as cors from 'cors';
import * as querystring from 'querystring';
import fetch from 'node-fetch';
import { parseScgAnswer } from "./html-parser";

const compression = require('compression');
const app = express()
    .use(morgan(':method :url -> :status'))
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(cors());

app.use(compression({ threshold: 0 }));
app.use(express.static('dist'));

const pageSize = 25;

app.get('/api', async function (req, resp) {
    const query = querystring.stringify({
        name: req.query.name,
        numpage: pageSize,
        startnum: +req.query.page * pageSize || 0,
    });
    const answer = await (await fetch(`http://www.starcitygames.com/results?${query}`)).text();
    resp.status(200).send(parseScgAnswer(answer));
});
app.get('*', function (req, resp) {
    resp.status(404).send({
        message: 'NOT_FOUND',
        method: req.method,
        url: req.url
    });
});

const port = 8081;

app.listen(port, function () {
    console.log(colors.cyan(`Auctioneer server is running at http://localhost:${port}`));
});
