import * as fs from 'fs';
import { downloadFile } from '@tuktuk-scg-scrapper/common/downloadFile';
import { logError, logInfo } from '@tuktuk-scg-scrapper/common/logger';

import FlexSearchDefault from 'flexsearch';
const FlexSearch: any = FlexSearchDefault;

const s3IndexPath = 'https://storage.yandexcloud.net/tuktuk/index.json';
const metaPath = './data/index.meta.json';
const indexPath = './data/index.json';

if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

const updateIndex = async () => {
    const downloadIndex = async (etag: string) => {
        const tmpPath = `${indexPath}.tmp`;
        const { download } = await downloadFile(s3IndexPath);
        await download(fs.createWriteStream(tmpPath));
        fs.renameSync(tmpPath, indexPath);
        fs.writeFileSync(metaPath, JSON.stringify({ etag }));
    };

    if (!fs.existsSync(metaPath) || !fs.existsSync(indexPath)) {
        logInfo('No index detected. Initializing.');
        const { headers, destroy } = await downloadFile(s3IndexPath);
        destroy();
        await downloadIndex(headers.etag);
    } else {
        const { etag } = JSON.parse(fs.readFileSync(metaPath).toString());
        logInfo(`Index found. etag: ${etag}`);
        try {
            const { headers, destroy } = await downloadFile(s3IndexPath);
            destroy();

            if (etag !== headers.etag) {
                logInfo(`New index detected. Downloading. (old etag: ${etag} new etag: ${headers.etag})`);
                await downloadIndex(headers.etag);
                return true;
            } else {
                logInfo(`Index is up to date. etag: ${etag}`);
            }
        } catch (e) {
            logError('Failed to update index: ', e);
        }
    }
    return false;
};

export const shouldUpdateIndex = updateIndex;

export const getIndex = async () => {
    const index = new FlexSearch.Document({
        split: /\s+| % /,
        doc: {
            id: 'id',
            index: ['search'],
            store: ['en', 'ru', 'text'],
        },
    });

    await updateIndex();

    const storage = JSON.parse(fs.readFileSync(indexPath).toString());
    Object.entries(storage).forEach(([key, value]) => {
        index.import(key, value);
    })
    return index;
};
