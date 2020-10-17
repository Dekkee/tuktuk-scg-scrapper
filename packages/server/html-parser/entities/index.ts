import * as async from 'async';
import fetch from 'node-fetch';
import { Meta, ParsedRow } from '@tuktuk-scg-scrapper/common/Row';

export type cardName = {
    'original-name': string;
    name: string;
    meta: Meta;
};

export const parseName = (originalName: string): cardName => {
    const [, name, m] = originalName.match(/([\w\s-'\/,\.:]+)(?:\[([\w-]+)\])?/) || [];
    const [sgl, mtg, set, num, lang] = m.split('-');
    let meta: Meta = m;
    if (sgl === 'SGL' && mtg === 'MTG') {
        const l = lang.slice(0, 2);
        const f = lang.slice(-1) === 'F';

        let fullSet = set;
        if (set === 'PRM') {
            const subSet = num.split('_')[0];
            fullSet = `${set}-${subSet}`;
        }

        meta = {
            original: m,
            set: fullSet,
            num,
            lang: l,
            foil: f,
        };
    }
    return {
        'original-name': originalName,
        name: name.trim(),
        meta,
    };
};

export const fillCardPrices = async (cards: Partial<ParsedRow>[]) => {
    await async.map(cards, async (row) => {
        const {
            response,
        } = await // await fetch(`https://newstarcityconnector.herokuapp.com/eyApi/products/${row.id}/variants`)
        (await fetch(`https://starcitygames.com/remote/v1/product-attributes/${row.id}`)).json();
        row.cards = [];
        (response.data || []).forEach(({ price, option_values = [], inventory_level, purchasing_disabled }: any) => {
            if (!price) {
                return;
            }
            const card = {
                price,
                stock: inventory_level,
                purchasing_disabled,
                ...option_values.reduce(
                    (acc, curr) => ({
                        ...acc,
                        [curr['option_display_name'].toLowerCase()]: curr['label'],
                    }),
                    {}
                ),
            };
            if (card.condition) card.condition = parseCondition(card.condition);

            if (!card.purchasing_disabled) {
                row.cards.push(card);
            }
        });
        row.cards.sort((a, b) => (conditionMap[b.condition] || 0) - (conditionMap[a.condition] || 0));
        return row;
    });
};

const parseCondition = (cond: string) => {
    switch (cond) {
        case 'Played':
            return 'PL';
        case 'Heavily Played':
            return 'HP';
        case 'Near Mint':
            return 'NM';
        case 'Damaged':
            return 'DM';
        default:
            return cond;
    }
};

const conditionMap = {
    NM: 4,
    PL: 3,
    HP: 2,
    DM: 1,
};
