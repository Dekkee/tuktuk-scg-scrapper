import * as fs from 'fs';
import yargs from 'yargs';
import { generate } from './generate';

if (!fs.existsSync('./generated')) {
    fs.mkdirSync('./generated');
}

const argv = yargs(process.argv.slice(2))
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
    })
    .parseSync();

generate({ local: argv.local, slim: argv.slim, upload: argv.upload })
    .then(() => console.log('Index ready'))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
