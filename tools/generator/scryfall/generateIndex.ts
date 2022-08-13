import * as fs from 'fs';

const { Transform } = require('stream');
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

const filteredLayouts = new Set(['art_series', 'emblem']);

const filteredCards = [];
const failedCards = [];

export const createIndexStream = () => {
    const map = {};

    const parseCard = (card) => {
        try {
            if (filteredLayouts.has(card.layout)) {
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
                    map[card.name].localizedName = card.printed_name || card.name;
                }
                if (Array.isArray(card.card_faces)) {
                    map[card.name].text = '';
                    map[card.name].localizedName = '';
                    card.card_faces.forEach((face) => {
                        map[card.name].names.add(face.printed_name || face.name);
                        map[card.name].text += `${face.oracle_text} `;
                        map[card.name].localizedName += `${face.printed_name} `;
                    });
                }
            }
        } catch (e) {
            failedCards.push({ card, error: e });
        }
    };

    return new Transform({
        writableObjectMode: true,
        readableObjectMode: true,
        autoDestroy: true,
        write: function (chunk, encoding, callback) {
            parseCard(chunk.value);
            this.push(chunk);
            callback();
        },
        final: (callback) => {
            let id = 0;
            Object.entries(map).forEach(([key, value]: any[]) => {
                const c = {
                    id: id++,
                    search: `${[...value.names.values()].reverse().join(' % ')}`,
                    card: {
                        name: key,
                        text: value.text && value.text.length > 70 ? `${value.text.slice(0, 70)}...` : value.text,
                        localizedName: value.localizedName,
                        scryfallId: value.scryfallId,
                    },
                };
                index.add(c);
            });
            
            const storage = {};
            index.export(((key, value) => {
                storage[key] = value;   
                callback();
                if (key === 'store') {
                    fs.writeFileSync(`${path}/index.json`, JSON.stringify(storage));
                }
            }))
            
            fs.writeFileSync(`${path}/filtered.json`, JSON.stringify(filteredCards));
            fs.writeFileSync(`${path}/failed.json`, JSON.stringify(failedCards));
        },
    });
};
