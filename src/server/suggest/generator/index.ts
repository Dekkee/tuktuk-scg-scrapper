import fetch from 'node-fetch';
import * as fs from "fs";
import { generateJson } from './generateJson';
import { generateTypings } from './generateTypings';

const url = 'https://www.mtgjson.com/json/AllCards.json';
const metaUrl = 'https://www.mtgjson.com/json/version.json';

if (!fs.existsSync('./generated')) {
    fs.mkdirSync('./generated');
}
if (!fs.existsSync('./generated/source')) {
    fs.mkdirSync('./generated/source');
}
if (!fs.existsSync('./generated/typing')) {
    fs.mkdirSync('./generated/typing');
}
if (!fs.existsSync('./generated/schema')) {
    fs.mkdirSync('./generated/schema');
}

const initialize = async () => {
    const meta = await (await fetch(metaUrl)).json();
    if (!fs.existsSync('./generated/source/meta.json')) {
        console.log('download new cards');
        const resp = await fetch(url);
        console.log(`Is OK: ${resp.ok}`);
        const json = await (resp).json();
        fs.writeFileSync('./generated/source/AllCards.json', JSON.stringify(json));
        fs.writeFileSync('./generated/source/meta.json', JSON.stringify(meta));
        generateJson('card', Object.values(json));
        await generateTypings();
    }
};

initialize().then(_ => console.log('initialized'));
