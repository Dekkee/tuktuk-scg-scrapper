import * as async from 'async';
import { Meta, ParsedRow } from '@tuktuk-scg-scrapper/common/Row';

export type cardName = {
    name: string;
    meta: Meta;
};

export const parseMeta = (m: string): Meta => {
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
    return meta;
};

export const fillCardPrices = async (
    cards: Partial<ParsedRow>[],
    cookie: string,
    attributeKey: number,
    options: { value: number; condition: string }[]
) => {
    // csrf_token пропал из BCData при редизайне SCG 2026-07;
    // remote/v1 отвечает и без x-xsrf-token — достаточно cookie
    const headers = new Headers({
        cookie,
        'x-requested-with': 'XMLHttpRequest',
    });
    await async.map(cards, async (row) => {
        row.cards = [];
        await async.map(options, async ({ value, condition }) => {
            const fd = new URLSearchParams();
            fd.append(`attribute[${attributeKey}]`, value.toString());
            const response = await fetch(`https://starcitygames.com/remote/v1/product-attributes/${row.id}`, {
                headers,
                method: 'POST',
                body: fd,
            });
            const { data } = await response.json();
            parsePrice(data, row.cards, condition);

            return row;
        });
    });
};

const parsePrice = ({ price, stock, purchasable }: any, arr: any[], condition: string) => {
    if (!price) {
        return;
    }
    const card = {
        price: price?.without_tax?.value,
        stock,
        purchasing_disabled: !purchasable,
        condition,
    };

    if (!card.purchasing_disabled) {
        arr.push(card);
    }
};
