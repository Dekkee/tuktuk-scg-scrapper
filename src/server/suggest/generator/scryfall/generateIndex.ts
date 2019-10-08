import * as fs from "fs";

const FlexSearch = require("flexsearch");

const index = new FlexSearch({
    split: /\s+| % /,
    doc: {
        id: 'id',
        field: [
            'search'
        ]
    }
});

if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

export const initializeIndex = async (json) => {
    let values;
    values = Object.values(json);

    const map = {};
    values.forEach((card) => {
        if (card.lang === 'ru' || card.lang === 'en') {
            if (!(card.name in map)) {
                map[card.name] = {
                    names: new Set([card.printed_name, card.name]),
                    text: card.oracle_text,
                }
            } else {
                map[card.name].names.add(card.printed_name || card.name)
            }
            if (Array.isArray(card.card_faces)) {
                map[card.name].text = '';
                card.card_faces.forEach((face) => {
                    map[card.name].names.add(face.printed_name || face.name);
                    map[card.name].text += `${face.oracle_text} `;
                })
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
                text: value.text && value.text.length > 70 ? `${value.text.slice(0, 70)}...` : value.text,
            },
        });
    });
    index.add(doc);

    fs.writeFileSync('./data/index.json', index.export());
};
