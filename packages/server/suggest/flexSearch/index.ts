import * as fs from 'fs';
import { downloadFile } from '@tuktuk-scg-scrapper/common/downloadFile';

const FlexSearch = require('flexsearch');

const s3IndexPath = 'https://dekkee.s3.eu-west-2.amazonaws.com/tuktuk/index.json';
const metaPath = './data/index.meta.json';
const indexPath = './data/index.json';

if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

const updateIndex = async () => {
    if (!fs.existsSync(metaPath)) {
        console.log('No index detected. Initializing.');
        const { headers, download } = await downloadFile(s3IndexPath);
        const { etag } = headers;
        fs.writeFileSync(metaPath, JSON.stringify({ etag }));
        await download(fs.createWriteStream(indexPath));
    } else {
        console.log('Index found.');
        const { etag } = JSON.parse(fs.readFileSync(metaPath).toString());
        try {
            const { headers, download, destroy } = await downloadFile(s3IndexPath);

            if (etag !== headers.etag) {
                console.log('New index detected. Downloading.');
                fs.writeFileSync(metaPath, JSON.stringify({ etag: headers.etag }));
                await download(fs.createWriteStream(indexPath));
                return true;
            } else {
                destroy();
                console.log('Index is up to date');
            }
        } catch (e) {
            console.error('Failed to update index: ', e);
        }
    }
    return false;
};

export const shouldUpdateIndex = updateIndex;

export const getIndex = async () => {
    const index = new FlexSearch({
        split: /\s+| % /,
        doc: {
            id: 'id',
            field: ['search'],
        },
    });

    await updateIndex();
    const idx = fs.readFileSync(indexPath);
    index.import(idx);
    return index;
};
