import * as fs from 'fs';
import { loadJson } from './loadJson';
import { createProgressStream } from './progress';
import { uploadToS3 } from './uploadToS3';
import { createIndexStream, IndexPayload } from './generateIndex';
import { readJson } from './readJson';
import { createSchemaStream } from './generateSchema';

import { PassThrough } from 'stream';
import { chain } from 'stream-chain';
// stream-json 3.x ships ESM "exports" map that TS moduleResolution "node10" cannot follow,
// so use require() to bypass type-resolution while keeping runtime interop via Node 22 require(esm).
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/stream-array.js');

type GenerateOpts = { slim?: boolean, local?: boolean, upload?: boolean, cloud?: boolean };

export const generate = (opts: GenerateOpts) => {
    return new Promise<void>(async (resolve, reject) => {
        const isCloud = !!opts.cloud;
        const shouldReadData = !isCloud && (opts.slim || opts.local);
        const shouldUpload = opts.upload;

        const localPath = opts.slim ? './generated/data.json' : './generated/data.json';
        const { stream: dataStream, total } = await (shouldReadData ? readJson(localPath) : loadJson());
        shouldReadData ? console.log(`Reading ${localPath}`) : console.log('Downloading');

        const rawDataStream = new PassThrough({ allowHalfOpen: false, objectMode: true });

        let indexPayload: IndexPayload | undefined;
        const onReady = isCloud
            ? async (payload: IndexPayload) => {
                indexPayload = payload;
            }
            : undefined;

        const stages: any[] = [
            dataStream,
            rawDataStream,
            createProgressStream(total),
            parser(),
            streamArray(),
        ];

        if (!isCloud) {
            stages.push(createSchemaStream('card'));
        }

        stages.push(createIndexStream({ onReady }));

        const pipeline = chain(stages.filter(Boolean));

        if (!isCloud && !shouldReadData) {
            console.log(`Writing index on disk: ${localPath}`);
            rawDataStream.pipe(fs.createWriteStream(localPath));
        }

        pipeline.on('error', (e) => {
            console.error(e);
            reject(e);
        });
        pipeline.on('end', async () => {
            try {
                if (!isCloud) {
                    console.log('Generate typings');
                    // Lazy require: generateTypings.ts has a top-level fs.mkdirSync side
                    // effect that would run at cold-start in the Yandex Cloud bundle and
                    // fail on the read-only function-code directory.
                    const { generateTypings } = require('./generateTypings');
                    await generateTypings();
                }
                if (shouldUpload || isCloud) {
                    console.log('Uploading index to S3');
                    const body = isCloud && indexPayload
                        ? JSON.stringify(indexPayload.index)
                        : fs.readFileSync('./generated/index/index.json');
                    await uploadToS3(body);
                    console.log('Success');
                }
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    });
};
