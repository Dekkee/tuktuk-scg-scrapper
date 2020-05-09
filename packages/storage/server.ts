import { Application } from 'express';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { connect } from './connect';
import { cardRoute } from './routes/card';
import * as morgan from 'morgan';
const isDocker = require("is-docker");

const app: Application = express();
const port = 8084;

if (!isDocker()) {

}

app.use(bodyParser.json());

const runApp = async () => {
    try {
        await connect();

        app.use(morgan(':method :url -> :status')).listen(port, () =>
          console.log(`Application started successfully on port ${port}.`)
        );
        cardRoute({ app });
    } finally {
    }
};
runApp();
