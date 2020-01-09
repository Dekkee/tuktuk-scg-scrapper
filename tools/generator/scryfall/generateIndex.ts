import * as fs from 'fs';

const FlexSearch = require('flexsearch');

const index = new FlexSearch({
    split: /\s+| % /,
    doc: {
        id: 'id',
        field: ['search'],
    },
});

if (!fs.existsSync('./generated')) {
    fs.mkdirSync('./generated');
}

if (!fs.existsSync('./packages/server/data')) {
    fs.mkdirSync('./packages/server/data');
}

const filteredLayouts = new Set(['art_series', 'emblem']);

export const initializeIndex = async json => {
    let values;
    values = Object.values(json);

    const map = {};
    values.forEach(card => {
        if (filteredLayouts.has(card.layout)) {
            return;
        }
        const isRu = card.lang === 'ru';
        const isEn = card.lang === 'en';
        if (isRu || isEn) {
            if (!(card.name in map)) {
                map[card.name] = {
                    names: new Set([card.printed_name, card.name]),
                    text: card.oracle_text,
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
                card.card_faces.forEach(face => {
                    map[card.name].names.add(face.printed_name || face.name);
                    map[card.name].text += `${face.oracle_text} `;
                    map[card.name].localizedName += `${face.printed_name} `;
                });
            }
        }
    });
    let id = 0;
    const doc = [];
    Object.entries(map).forEach(([key, value]: any[]) => {
        doc.push({
            id: id++,
            search: `${[...value.names.values()].reverse().join(' % ')}`,
            card: {
                name: key,
                text:
                    value.text && value.text.length > 70
                        ? `${value.text.slice(0, 70)}...`
                        : value.text,
                localizedName: value.localizedName,
            },
        });
    });
    index.add(doc);

    fs.writeFileSync('./packages/server/data/index.json', index.export());
};
