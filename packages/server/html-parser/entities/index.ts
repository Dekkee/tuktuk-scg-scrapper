import * as async from 'async';
import fetch from 'node-fetch';
import { ParsedRow } from '@tuktuk-scg-scrapper/common/Row';

export type cardName = {
    'original-name': string;
    name: string;
    meta: string;
};

export const parseName = (originalName: string): cardName => {
    const [, name, meta] =
        originalName.match(/([\w\s-'\/,\.:]+)(?:\[([\w-]+)\])?/) || [];
    return {
        'original-name': originalName,
        name: name.trim(),
        meta,
    };
};

export type cardSet = {
    'original-set': string;
    set: string;
    'set-meta': string;
    foil: boolean;
};

export const parseSet = (originalSet: string): cardSet => {
    const [, setMeta, set, foil] =
        originalSet.match(
            /SHOP\/(?:([\w\/\s]+)\/)?([\w\s&:']+)\s*(\(Foil\))?/i
        ) || [];
    return {
        'original-set': originalSet,
        set: set.trim(),
        'set-meta': setMeta,
        foil: !!foil,
    };
};

export const fillCardPrices = async (cards: Partial<ParsedRow>[]) => {
    await async.map(cards, async (row, cb) => {
        const { response } = await (
            await fetch(
                `https://newstarcityconnector.herokuapp.com/eyApi/products/${row.id}/variants`
            )
        ).json();
        row.cards = [];
        (response.data || []).forEach(
            ({ price, option_values = [], inventory_level }: any) => {
                if (!price) {
                    return;
                }
                const card = {
                    price,
                    stock: inventory_level,
                    ...option_values.reduce(
                        (acc, curr) => ({
                            ...acc,
                            [curr['option_display_name'].toLowerCase()]: curr[
                                'label'
                            ],
                        }),
                        {}
                    ),
                };
                if (card.condition)
                    card.condition = parseCondition(card.condition);
                row.cards.push(card);
            }
        );
        row.cards.sort(
            (a, b) =>
                (conditionMap[b.condition] || 0) -
                (conditionMap[a.condition] || 0)
        );
        cb(null, row);
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
