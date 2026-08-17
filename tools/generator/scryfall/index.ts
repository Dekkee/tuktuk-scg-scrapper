import * as fs from 'fs';
import { generate } from './generate';

if (!fs.existsSync('./generated')) {
    fs.mkdirSync('./generated');
}

// No yargs: it is ESM-only and this entry runs under ts-node in CJS mode.
const args = new Set(process.argv.slice(2));

generate({ local: args.has('--local'), slim: args.has('--slim'), upload: args.has('--upload') })
    .then(() => console.log('Index ready'))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
