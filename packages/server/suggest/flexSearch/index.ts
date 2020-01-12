import * as fs from 'fs';

const FlexSearch = require('flexsearch');

const index = new FlexSearch({
    split: /\s+| % /,
    doc: {
        id: 'id',
        field: ['search'],
    },
});

export const getIndex = () => {
    const idx = fs.readFileSync('./data/index.json');
    index.import(idx);
    return index;
};
