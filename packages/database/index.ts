import { Application } from 'express';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { connect } from './connect';
import { cardRoute } from './routes/card';

const app: Application = express();
const port = 8080;

app.use(bodyParser.json());

const runApp = async () => {
    try {
        await connect();

        app.listen(port, () =>
          console.log(`Application started successfully on port ${port}.`)
        );
        cardRoute({ app });
    } finally {
    }
};
runApp();
