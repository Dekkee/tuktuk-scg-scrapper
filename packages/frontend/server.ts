import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as colors from 'colors';
import * as cors from 'cors';

const compression = require('compression');
const app = express()
    .use(morgan(':method :url -> :status'))
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(cors());


app.use(compression({ threshold: 0 }));
app.use(express.static('../../dist'));


const port = 8083;

const server = app.listen(port, function () {
    console.log(colors.cyan(`Frontend http://localhost:${port}`));
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
