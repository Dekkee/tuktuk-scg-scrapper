import * as fs from 'fs';
import * as zlib from 'zlib';
import { loadJson, getBulkInfo, BulkInfo } from './loadJson';
import { createProgressStream } from './progress';
import { uploadToS3, getStoredUpdatedAt } from './uploadToS3';
import { createIndexStream, IndexPayload } from './generateIndex';
import { readJson } from './readJson';
import { createSchemaStream } from './generateSchema';

import { PassThrough } from 'stream';
import { chain } from 'stream-chain';
import { parser as jsonlParser } from 'stream-json/jsonl/parser.js';

type GenerateOpts = { slim?: boolean; local?: boolean; upload?: boolean; cloud?: boolean };

// Plain async (not a promise-executor): a throw anywhere here must reject the
// caller, otherwise the cloud invocation hangs silently until the 600s timeout.
export const generate = async (opts: GenerateOpts) => {
    const isCloud = !!opts.cloud;
    const shouldReadData = !isCloud && (opts.slim || opts.local);
    const shouldUpload = opts.upload;

    // Throttle: only rebuild when Scryfall's bulk has actually changed since
    // the index.json we last uploaded (nightly cloud path only). On unchanged
    // days this skips the ~400 MB download and the in-memory rebuild entirely.
    let bulkInfo: BulkInfo | undefined;
    if (!shouldReadData) {
        bulkInfo = await getBulkInfo();
        if (isCloud) {
            const stored = await getStoredUpdatedAt();
            if (stored && stored === bulkInfo.updatedAt) {
                console.log(`Index already current (scryfall updated_at=${bulkInfo.updatedAt}); skipping rebuild`);
                return;
            }
        }
    }

    const localPath = './generated/data.jsonl.gz';
    const { stream: dataStream, total } = await (shouldReadData ? readJson(localPath) : loadJson(bulkInfo));
    shouldReadData ? console.log(`Reading ${localPath}`) : console.log('Downloading');

    const rawDataStream = new PassThrough({ allowHalfOpen: false, objectMode: true });

    let indexPayload: IndexPayload | undefined;
    const onReady = isCloud
        ? async (payload: IndexPayload) => {
              indexPayload = payload;
          }
        : undefined;

    // Progress counts the compressed bytes (matches content-length), so the
    // gunzip stage sits after it; jsonlParser emits {key, value} chunks like
    // streamArray did, so the downstream stages are unchanged.
    const stages: any[] = [dataStream, rawDataStream, createProgressStream(total), zlib.createGunzip(), jsonlParser()];

    if (!isCloud) {
        stages.push(createSchemaStream('card'));
    }

    stages.push(createIndexStream({ onReady }));

    const pipeline = chain(stages.filter(Boolean));

    if (!isCloud && !shouldReadData) {
        console.log(`Writing data on disk: ${localPath}`);
        rawDataStream.pipe(fs.createWriteStream(localPath));
    }

    await new Promise<void>((resolve, reject) => {
        pipeline.on('error', reject);
        pipeline.on('end', resolve);
    });

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
        const body =
            isCloud && indexPayload
                ? JSON.stringify(indexPayload.index)
                : fs.readFileSync('./generated/index/index.json');
        const metadata = bulkInfo ? { 'scryfall-updated-at': bulkInfo.updatedAt } : undefined;
        await uploadToS3(body, metadata);
        console.log('Success');
    }
};
