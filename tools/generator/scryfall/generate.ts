import * as fs from 'fs';
import { loadJson } from './loadJson';
import { createProgressStream } from './progress';
import { createSchemaStream } from './generateSchema';
import { generateTypings } from './generateTypings';
import { uploadToS3 } from './uploadToS3';
import { createIndexStream } from './generateIndex';
import { readJson } from './readJson';
// import { createDatabaseStream } from './updateDatabase';

const { PassThrough } = require('stream');
const { chain } = require('stream-chain');
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');

type GenerateOpts = { slim?: boolean, local?: boolean, upload?: boolean };

export const generate = (opts: GenerateOpts) => {
    return new Promise<void>(async (resolve, reject) => {
        const shouldReadData = opts.slim || opts.local;
        const shouldUpload = opts.upload;

        const localPath = opts.slim ? './generated/data.json' : './generated/data.json';
        const { stream: dataStream, total } = await (shouldReadData ? readJson(localPath) : loadJson());
        shouldReadData ? console.log(`Reading ${localPath}`) : console.log('Downloading')

        const rawDataStream = new PassThrough({ allowHalfOpen: false, objectMode: true });
        const parsedCardStream = new PassThrough({ allowHalfOpen: false, objectMode: true });

        const pipeline = chain([
            dataStream,
            rawDataStream,
            createProgressStream(total),
            parser(),
            streamArray(),
            createSchemaStream('card'),
            createIndexStream(),
            // argv.store && await createDatabaseStream(),
        ].filter(Boolean));

        if (!shouldReadData) {
            console.log(`Writing index on disk: ${localPath}`);
            rawDataStream.pipe(fs.createWriteStream(localPath))
        }

        pipeline.on('error', (e) => {
            console.error(e);
            reject(e);
        });
        pipeline.on('end', async () => {
            console.log('Generate typings');
            await generateTypings();
            if (shouldUpload) {
                console.log('Uploading index to S3');
                await uploadToS3();
                console.log('Success');
            }
            resolve();
        });
    });
};
