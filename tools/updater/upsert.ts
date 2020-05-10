import { connect, disconnect } from '@tuktuk-scg-scrapper/storage/connect';
import { Card } from '@tuktuk-scg-scrapper/storage/schemas/card';
import fetch from 'node-fetch';

const { Writable } = require('stream');

const uploadStream = new Writable({
    objectMode: true,
    autoDestroy: true,
    write: async function (chunk, encoding, callback) {
        try {
            fetch('https://scg.dekker.gdn/storage/card', {
                method: 'PUT',
                body: chunk.value,
            });
        } catch (e) {
            console.error('Failed to update', e);
        } finally {
            callback();
        }
    },
});

const upsertDatabase = async () => {
    await connect();
    const pipeline = Card.find().cursor().pipe(uploadStream);
    pipeline.on('end', async () => {
        await disconnect();
    });
};

upsertDatabase().catch((e) => console.error(e));
