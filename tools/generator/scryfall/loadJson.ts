import axios from 'axios';
import * as fs from 'fs';
import * as Progress from 'progress';

const prettyBytes = require('pretty-bytes');

const pathToRawJson = './generated/rawIndex.json';

export const loadJson = async () => {
    if (!fs.existsSync(pathToRawJson)) {
        console.log('Raw index not found. Downloading.');
        await downloadJson(
            'https://archive.scryfall.com/json/scryfall-all-cards.json'
        );

        return fs.readFileSync(pathToRawJson);
    }

    console.log('Reading raw index from disc');
    return fs.readFileSync(pathToRawJson);
};

const downloadJson = async (url: string) => {
    return new Promise(async (resolve, reject) => {
        const { data, headers } = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        });
        const totalLength = headers['content-length'];
        if (!totalLength) {
            let currentBytes = 0;
            const prefix = 'Loaded: ';
            process.stdout.write(`${prefix}${currentBytes} B`);
            data.on('data', chunk => {
                currentBytes += chunk.length;
                process.stdout.cursorTo(prefix.length);
                process.stdout.clearLine(1);
                process.stdout.write(`${prettyBytes(currentBytes)}`);
            });
        } else {
            const progressBar = new Progress(
                '-> downloading [:bar] :percent :etas',
                {
                    width: 40,
                    complete: '=',
                    incomplete: ' ',
                    renderThrottle: 1,
                    total: parseInt(totalLength),
                }
            );
            data.on('data', chunk => progressBar.tick(chunk.length));
        }

        const writer = fs.createWriteStream(pathToRawJson);

        data.pipe(writer);
        data.on('end', () => {
            process.stdout.write('\n');
            resolve();
        });
        data.on('error', reject);
    });
};
