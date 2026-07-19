/**
 * Production static server for the frontend container.
 *
 * The frontend UI is bundled by Vite (`npm run build` -> repo-root `/dist`).
 * This small Express app is what actually serves that bundle in production:
 * it is the ENTRYPOINT of packages/frontend/Dockerfile
 * (`node -r ts-node/register server.ts`, EXPOSE 8083) and backs the `frontend`
 * service in docker-compose.yml. It serves the compiled assets from ../../dist
 * and falls back to dist/index.html for client-side (SPA) routes (`/`, `/card...`).
 *
 * It is NOT used in local development -- `npm run dev` runs the Vite dev server
 * (see packages/frontend/package.json), so this file only runs inside the
 * production container.
 */
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import * as colors from 'colors';
import * as path from 'path';
import cors from 'cors';
import { config } from '@tuktuk-scg-scrapper/common/config/frontend';
import compression from 'compression';

const app = express()
    .use(morgan(':method :url -> :status'))
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(cors());

app.use(compression({ threshold: 0 }));
app.use(express.static('../../dist'));

app.get(/^(\/card|\/$)/, function (req, resp) {
    resp.sendFile(path.join(__dirname, '../../dist/index.html'));
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
