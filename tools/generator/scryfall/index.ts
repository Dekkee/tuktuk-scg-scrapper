import * as fs from 'fs';
import { loadJson } from './loadJson';
import { createProgressStream } from './progress';
import { createSchemaStream } from './generateSchema';
import { generateTypings } from './generateTypings';
import { uploadToS3 } from './uploadToS3';
import { createIndexStream } from './generateIndex';
import { readJson } from './readJson';
import { createDatabaseStream } from './updateDatabase';

const { chain } = require('stream-chain');
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');

if (!fs.existsSync('./generated')) {
    fs.mkdirSync('./generated');
}

const generate = () => {
    return new Promise<void>(async (resolve, reject) => {
        const { stream: dataStream, total } = await readJson(); // await loadJson();
        const pipeline = chain([
            dataStream,
            createProgressStream(total),
            parser(),
            streamArray(),
            createSchemaStream('card'),
            createIndexStream(),
            // await createDatabaseStream(),
        ]);

        pipeline.on('error', (e) => {
            console.error(e);
            reject(e);
        });
        pipeline.on('end', async () => {
            console.log('Generate typings');
            await generateTypings();
            console.log('Uploading index to S3');
            await uploadToS3();
            console.log('Success');
            resolve();
        });
    });
};

generate().then((_) => console.log('Index ready'));
