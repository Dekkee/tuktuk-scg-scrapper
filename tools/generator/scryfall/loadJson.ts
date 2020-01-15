import * as fs from 'fs';
import { downloadFile } from '@tuktuk-scg-scrapper/common/downloadFile';

const pathToRawJson = './generated/rawIndex.json';

export const loadJson = async () => {
    if (!fs.existsSync(pathToRawJson)) {
        console.log('Raw index not found. Downloading.');
        const { download } = await downloadFile(
            'https://archive.scryfall.com/json/scryfall-all-cards.json'
        );

        await download(fs.createWriteStream(pathToRawJson));

        return fs.readFileSync(pathToRawJson);
    }

    console.log('Reading raw index from disc');
    return fs.readFileSync(pathToRawJson);
};
