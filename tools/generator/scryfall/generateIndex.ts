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
        store: ['en', 'ru', 'text'],
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
                filteredSetTypes.has(card.set_type) || 
                (card.border_color === 'borderless' && map[card.name]?.[card.lang])
            ) {
                filteredCards.push(card);
                return;
            }
            const isRu = card.lang === 'ru';
            const isEn = card.lang === 'en';
            if (isRu || isEn) {
                // if (card.name.includes('Myrel') && card.set != 'slu') {
                //     console.log(`==========`);
                //     console.log(card.lang);
                //     console.log(card.set);
                //     console.log(card.name);
                //     console.log(card.printed_name);
                //     console.log(card.card_faces?.map(({ printed_name, name }) => `${printed_name} || ${name}`));
                //     console.log(card.border_color);
                // }

                if (!(card.name in map)) {
                    map[card.name] = {
                        names: new Set(),
                    };
                }

                if (Array.isArray(card.card_faces)) {
                    map[card.name][card.lang] = map[card.name][card.lang] || {};
                    map[card.name].text = '';
                    map[card.name][card.lang].scryfallId = card.id;
                    const faces = [];
                    card.card_faces.forEach((face) => {
                        map[card.name].names.add(face.printed_name || face.name);
                        map[card.name].text += `${face.oracle_text} `;
                        faces.push(face.printed_name || face.name);
                    });
                    if (faces.length) {
                        map[card.name][card.lang].name = faces.join(' // ');
                    }
                } else {
                    map[card.name].names.add(card.printed_name || card.name);
                    map[card.name].text = card.oracle_text;
                    map[card.name][card.lang] = {
                        ...map[card.name][card.lang],
                        name: card.printed_name || card.name,
                        scryfallId: card.id,
                    }
                }
                // if (card.name.includes('Myrel') && card.set != 'slu') {
                //     console.log('===', map[card.name])
                // }
            }
        } catch (e) {
            console.error(e);
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
                    text: value.text,
                    en: {},
                    ru: {},
                };
                let variant = value.en;
                if (variant) {
                    c.en = {
                        name: variant.name,
                        scryfallId: variant.scryfallId,
                    }
                    variant = null;
                }
                variant = value.ru;
                if (variant) {
                    c.ru = {
                        name: variant.name,
                        scryfallId: variant.scryfallId,
                    }
                    variant = null;
                }

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
