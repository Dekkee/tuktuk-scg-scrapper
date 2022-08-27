import * as fs from 'fs';

const { Writable } = require('stream');
const FlexSearch = require('flexsearch');

const index = new FlexSearch.Document({
    split: /\s+| % /,
    preset: "score",
    tokenize: "forward",
    doc: {
        id: 'id',
        index: ['search'],
        store: ['card'],
    },
});

const path = './generated/index';

if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
}

const filteredLayouts = new Set(['art_series', 'emblem', 'token']);
const filteredSetTypes = new Set(['slu', 'promo']);

const filteredCards = [];
const failedCards = [];
let i = 0;

export const createIndexStream = () => {
    const map = {};

    const parseCard = (card) => {
        i++;

        try {
            if (
                filteredLayouts.has(card.layout) ||
                card.digital ||
                filteredSetTypes.has(card.set_type)
            ) {
                filteredCards.push(card);
                return;
            }
            const isRu = card.lang === 'ru';
            const isEn = card.lang === 'en';
            if (isRu || isEn) {
                if (!(card.name in map)) {
                    map[card.name] = {
                        names: new Set([card.printed_name, card.name]),
                        text: card.oracle_text,
                        scryfallId: card.id,
                    };
                } else {
                    map[card.name].names.add(card.printed_name || card.name);
                }
                if (isRu) {
                    map[card.name].localizedName = card.printed_name || card.name || map[card.name].localizedName;
                }
                if (Array.isArray(card.card_faces)) {
                    map[card.name].text = '';

                    const faces = [];
                    card.card_faces.forEach((face) => {
                        map[card.name].names.add(face.printed_name || face.name);
                        map[card.name].text += `${face.oracle_text} `;
                        if (face.printed_name) {
                            faces.push(face.printed_name);
                        }
                    });
                    if (faces.length) {
                        map[card.name].localizedName = faces.join(' // ')
                    }
                }
            }
        } catch (e) {
            failedCards.push({ card, error: e });
        }
    };

    return new Writable({
        objectMode: true,
        autoDestroy: true,
        write: function (chunk, encoding, callback) {
            parseCard(chunk.value);
            callback();
        },
        final: (callback) => {
            let id = 0;

            Object.entries(map).forEach(([key, value]: any[]) => {
                const c = {
                    id: id++,
                    search: `${[...value.names.values()].filter(Boolean).reverse().join(' % ')}`,
                    card: {
                        name: key,
                        text: value.text && value.text.length > 70 ? `${value.text.slice(0, 70)}...` : value.text,
                        localizedName: value.localizedName,
                        scryfallId: value.scryfallId,
                    },
                };
                index.add(c);
            });

            console.log(`Cards parsed: ${i}`);
            console.log(`Cards in index: ${id}`);
            console.log(`Cards filtered: ${filteredCards.length}`);
            console.log(`Cards failed: ${failedCards.length}`);

            const storage = {};
            return new Promise<void>((resolve) => {
                index.export(((key, value) => {
                    storage[key] = value;
                    if (key === 'store') {
                        console.log('Save index');
                        try {
                            fs.writeFileSync(`${path}/index.json`, JSON.stringify(storage));
                            fs.writeFileSync(`${path}/filtered.json`, JSON.stringify(filteredCards));
                            fs.writeFileSync(`${path}/failed.json`, JSON.stringify(failedCards));
                        }
                        catch (e) {
                            console.error(e);
                        }
                        finally {
                            resolve();
                        }
                    }
                }))
            }).then(callback);
        },
    });
};
