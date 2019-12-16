import { getIndex } from './flexSearch';

let index = getIndex();

export const suggest = (name: string) => {
    if (!index) {
        return null;
    }

    const isRu = /[а-яА-ЯЁё]/.test(name);
    return index.search(name, {
        field: 'search',
        limit: 20
    }).reduce((accumulator, { card }, index) => {
        accumulator[index + 1] = card;
        !isRu && delete card.localizedName;
        return accumulator;
    }, {});
};
