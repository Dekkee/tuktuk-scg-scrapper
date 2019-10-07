import fetch from 'node-fetch';
import * as fs from "fs";
import { generateJson } from './generateJson';
import { generateTypings } from './generateTypings';
import { initializeIndex } from './generateIndex';

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
    let scryfall = fs.readFileSync('C:\\Users\\dekke\\Downloads\\scryfall-all-cards (1).json');
    console.log('Generate schema');
    const json = JSON.parse(scryfall.toString());
    scryfall = null;
    console.log('parsed');
    generateJson('card', json);
    console.log('Generate typings');
    await generateTypings();
    initializeIndex(json);
    // const meta = await (await fetch(metaUrl)).json();
    // if (!fs.existsSync('./generated/source/meta.json')) {
    //     console.log('download new cards');
    //     const resp = await fetch(url);
    //     console.log(`Is OK: ${resp.ok}`);
    //     try {
    //         const json = await (resp).json();
    //         console.log('Store json');
    //         fs.writeFileSync('./generated/source/AllCards.json', JSON.stringify(json));
    //         fs.writeFileSync('./generated/source/meta.json', JSON.stringify(meta));
    //         console.log('Generate schema');
    //         generateJson('card', Object.values(json));
    //         console.log('Generate typings');
    //         await generateTypings();
    //         initializeIndex();
    //     } catch (e) {
    //         console.error('failed to initialize', e);
    //     }
    //
    // }
};

initialize().then(_ => console.log('initialization finished'));
