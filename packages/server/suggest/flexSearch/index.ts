import * as fs from 'fs';
import { downloadFile } from '@tuktuk-scg-scrapper/common/downloadFile';
import { logError, logInfo } from '@tuktuk-scg-scrapper/common/logger';

const FlexSearch = require('flexsearch');

const s3IndexPath = 'https://storage.yandexcloud.net/tuktuk/index.json';
const metaPath = './data/index.meta.json';
const indexPath = './data/index.json';

if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

const updateIndex = async () => {
    if (!fs.existsSync(metaPath)) {
        logInfo('No index detected. Initializing.');
        const { headers, download } = await downloadFile(s3IndexPath);
        const { etag } = headers;
        fs.writeFileSync(metaPath, JSON.stringify({ etag }));
        await download(fs.createWriteStream(indexPath));
    } else {
        const { etag } = JSON.parse(fs.readFileSync(metaPath).toString());
        logInfo(`Index found. etag: ${etag}`);
        try {
            const { headers, download, destroy } = await downloadFile(s3IndexPath);

            if (etag !== headers.etag) {
                logInfo(`New index detected. Downloading. (old etag: ${etag} new etag: ${headers.etag})`);
                fs.writeFileSync(metaPath, JSON.stringify({ etag: headers.etag }));
                await download(fs.createWriteStream(indexPath));
                return true;
            } else {
                destroy();
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
