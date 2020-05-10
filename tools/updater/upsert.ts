import { connect, disconnect } from '@tuktuk-scg-scrapper/storage/connect';
import { Card } from '@tuktuk-scg-scrapper/storage/schemas/card';
import fetch from 'node-fetch';
import * as queue from 'async/queue';
import * as Progress from 'progress';

const { chain } = require('stream-chain');
const { Transform } = require('stream');


// https://scg.dekker.gdn/storage/card
const fetchQueue = queue(async (value, callback) => {
    await fetch('http://localhost:8081/storage/card', {
        method: 'PUT',
        body: JSON.stringify(value),
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
    });
    callback();
}, 20);
let i =0;
const uploadStream = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    autoDestroy: true,
    write: async function (chunk, encoding, callback) {
        try {
            await fetchQueue.push(chunk);
            console.log("risolv", i++, chunk.name);
        } catch (e) {
            console.error('Failed to update', e);
        } finally {
            this.push(chunk)
            callback();
        }
    },
});

const upsertDatabase = async () => {
    await connect();
    const total = await Card.find().count();
    const progressBar = new Progress('-> uploading [:bar] :current/:total :percent :etas', {
        width: 40,
        complete: '=',
        incomplete: ' ',
        renderThrottle: 1,
        total,
    });
    const pipeline = chain([
        Card.find().cursor(),
        uploadStream,
        (c) => {
            progressBar.tick(1);
            return c;
        },
    ]);
    pipeline.on('end', async () => {
        await disconnect();
    });
};

upsertDatabase().catch((e) => console.error(e));
