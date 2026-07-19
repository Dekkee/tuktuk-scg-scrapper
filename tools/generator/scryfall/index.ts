import * as fs from 'fs';
import { loadJson } from './loadJson';
import { createProgressStream } from './progress';
import { createSchemaStream } from './generateSchema';
import { generateTypings } from './generateTypings';
import { uploadToS3 } from './uploadToS3';
import { createIndexStream } from './generateIndex';
import { readJson } from './readJson';
import { createDatabaseStream } from './updateDatabase';
import yargs from 'yargs';

import { PassThrough } from 'stream';
import { chain } from 'stream-chain';
// stream-json 3.x ships ESM "exports" map that TS moduleResolution "node10" cannot follow,
// so use require() to bypass type-resolution while keeping runtime interop via Node 22 require(esm).
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/stream-array.js');

if (!fs.existsSync('./generated')) {
    fs.mkdirSync('./generated');
}


const { argv } = yargs(process.argv.slice(2))
    .option('local', {
        boolean: true,
        describe: 'read local file',
    })
    .option('slim', {
        boolean: true,
        describe: 'read slim local file',
    })
    .option('upload', {
        boolean: true,
        describe: 'upload index to S3',
    })
    .option('store', {
        boolean: true,
        describe: 'store data in Mongo',
    });

const generate = () => {
    return new Promise<void>(async (resolve, reject) => {
        const shouldReadData = argv.slim || argv.local;
        const shouldUpload = argv.upload;

        const localPath = argv.slim ? './generated/data.json' : './generated/data.json';
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
                await uploadToS3(fs.readFileSync('./generated/index/index.json'));
                console.log('Success');
            }
            resolve();
        });
    });
};

generate().then((_) => console.log('Index ready'));
