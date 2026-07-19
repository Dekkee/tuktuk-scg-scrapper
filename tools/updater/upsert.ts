import { connect, disconnect } from '@tuktuk-scg-scrapper/storage/connect';
import { Card } from '@tuktuk-scg-scrapper/storage/schemas/card';
import queue from 'async/queue';
import Progress from 'progress';
import { chain } from 'stream-chain';
import { Transform } from 'stream';

const arr = [];

const fetchQueue = queue((value, callback) => {
    fetch('https://scg.dekker.lol/storage/card', {
        method: 'PUT',
        body: JSON.stringify(value),
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
        },
    })
        .then(callback)
        .catch((e) => arr.push(value.id));
}, 50);

const createUploadStream = (tick) => {
    return new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        autoDestroy: true,
        write: async function (chunk, encoding, callback) {
            try {
                await fetchQueue.push(chunk);
                tick();
                this.push(chunk);
            } catch (e) {
                console.error('Failed to update', e);
            } finally {
                callback();
            }
        },
    });
};

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
    const pipeline = chain([Card.find().cursor(), createUploadStream(() => progressBar.tick(1))]);
    pipeline.on('end', async () => {
        await disconnect();
        console.log('failed ids: ');
        console.info(JSON.stringify(arr));
    });
};

upsertDatabase().catch((e) => console.error(e));
