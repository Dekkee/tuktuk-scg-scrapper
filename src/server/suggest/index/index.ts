import { Card } from '../../../../generated/typing';
import * as fs from 'fs';

const FlexSearch = require("flexsearch");

const fetchJson = async () => {
    let values: Card[];
    const json = JSON.parse(fs.readFileSync('./generated/source/AllCards.json').toString());
    values = Object.values(json);

    const doc = [];
    let id = 0;
    values.forEach((card: Card) => {
        const namesArr = [card.name];
        card.foreignData.forEach((data) => {
            if (data.language === 'Russian') {
                namesArr.push(data.name);
            }
        });
        doc.push({
            id: id++,
            search: `${namesArr.reverse().join(' % ')}`,
            card: {
                name: card.name,
                text: card.text && card.text.length > 70 ? `${card.text.slice(0, 70)}...` : card.text,
            },
        });
    });
    const index = new FlexSearch({
        split: /\s+| % /,
        doc: {
            id: 'id',
            field: [
                'search'
            ]
        }
    });
    index.add(doc);

    return index;
};

export const getIndex = fetchJson;
