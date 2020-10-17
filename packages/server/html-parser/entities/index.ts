import * as async from 'async';
import fetch, { Headers } from 'node-fetch';
import { Meta, ParsedRow } from '@tuktuk-scg-scrapper/common/Row';
import { URLSearchParams } from 'url';

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

export const fillCardPrices = async (
    cards: Partial<ParsedRow>[],
    csrfToken: string,
    cookie: string,
    attribute: number
) => {
    const headers = new Headers({
        'x-xsrf-token': csrfToken,
        cookie,
        credentials: 'include',
    });
    await async.map(cards, async (row) => {
        row.cards = [];
        await async.map(conditions, async (condition) => {
            const fd = new URLSearchParams();
            fd.append(`attribute[${attribute}]`, condition.toString());
            const response = await fetch(`https://starcitygames.com/remote/v1/product-attributes/${row.id}`, {
                headers,
                method: 'POST',
                body: fd,
            });
            const { data } = await response.json();
            parsePrice(data, row.cards);

            return row;
        });
    });
};

const parsePrice = ({ price, stock, purchasable, selected_attributes }: any, arr: any[]) => {
    if (!price) {
        return;
    }
    const card = {
        price: price?.without_tax?.value,
        stock,
        purchasing_disabled: !purchasable,
        condition: conditionMap[`${Object.values<number>(selected_attributes)[0]}`],
    };

    if (!card.purchasing_disabled) {
        arr.push(card);
    }
};

const conditions = [114, 115, 116];

const conditionMap = {
    114: 'NM',
    115: 'PL',
    116: 'HP',
    // 117: 'DM',
};
