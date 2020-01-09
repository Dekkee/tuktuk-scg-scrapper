import * as fs from 'fs';

const FlexSearch = require('flexsearch');

const index = new FlexSearch({
    split: /\s+| % /,
    doc: {
        id: 'id',
        field: ['search'],
    },
});

if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

export const initializeIndex = async () => {
    let values;
    const json = JSON.parse(
        fs.readFileSync('../generated/source/AllCards.json').toString()
    );
    values = Object.values(json);

    const doc = [];
    let id = 0;
    values.forEach(card => {
        const namesArr = [card.name];
        card.foreignData.forEach(data => {
            if (data.language === 'Russian') {
                namesArr.push(data.name);
            }
        });
        doc.push({
            id: id++,
            search: `${namesArr.reverse().join(' % ')}`,
            card: {
                name: card.name,
                text:
                    card.text && card.text.length > 70
                        ? `${card.text.slice(0, 70)}...`
                        : card.text,
            },
        });
    });
    index.add(doc);

    fs.writeFileSync('../data/index.json', index.export());
};
