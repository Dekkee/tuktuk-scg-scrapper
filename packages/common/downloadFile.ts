import axios from 'axios';
import { WriteStream } from "fs";
import * as Progress from 'progress';

const prettyBytes = require('pretty-bytes');

export const downloadFile = async (url: string) => {
    const { data, headers } = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });

    const download = (writer: WriteStream) => new Promise<void>(async (resolve, reject) => {
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

        data.pipe(writer);
        data.on('end', () => {
            process.stdout.write('\n');
            resolve();
        });
        data.on('error', reject);
    });

    const destroy = () => data.destroy();

    return {
        headers,
        download,
        destroy
    }
};
