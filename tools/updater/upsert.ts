import { connect, disconnect } from '@tuktuk-scg-scrapper/storage/connect';
import { Card } from '@tuktuk-scg-scrapper/storage/schemas/card';
import fetch from 'node-fetch';
import * as queue from 'async/queue';
import * as Progress from 'progress';

const { chain } = require('stream-chain');
const { Writable } = require('stream');

const fetchQueue = queue(async (value, callback) => {
    const a = await fetch('https://scg.dekker.gdn/storage/card', {
        method: 'PUT',
        body: JSON.stringify(value),
    });
    console.log('done', value.name, a);
    callback();
}, 20);

const uploadStream = new Writable({
    objectMode: true,
    autoDestroy: true,
    write: async function (chunk, encoding, callback) {
        try {
            await fetchQueue.push(chunk);
        } catch (e) {
            console.error('Failed to update', e);
        } finally {
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
        (c) => {
            progressBar.tick(1);
            return c;
        },
        uploadStream,
    ]);
    pipeline.on('end', async () => {
        await disconnect();
    });
};

upsertDatabase().catch((e) => console.error(e));
