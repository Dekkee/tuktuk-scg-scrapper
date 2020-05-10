import { Card } from '../schemas/card';
import { Card as CardType, ScgCardPrice } from '../types';

import { TRoutesInput } from '../types/routes';
import { ParsedRow } from '@tuktuk-scg-scrapper/common/Row';

const langRegexp = /^(.*)(.)$/;
const numberRegexp = /^(.*)_(\d+)$/;

export const cardRoute = ({ app }: TRoutesInput) => {
    app.get('/storage/card', async (req, res) => {
        const now = Date.now();
        const query: any = {};
        const { name, price, limit } = req.query;
        if (name) {
            console.log(`Looking for: ${req.query.name}`);
            query.name = name.toString();
        }
        price !== 'false' && (query.$or = [{ scg_regular_id: { $exists: true } }, { scg_foil_id: { $exists: true } }]);

        const mongoQuery = Card.find(query);

        if (limit) {
            mongoQuery.limit(parseInt(limit.toString(), 10));
        }

        const cards = await mongoQuery.exec();
        console.log(`Found: ${cards.length} in ${Date.now() - now}ms`);
        return res.send({
            cards: cards.map(
                ({
                    name,
                    set,
                    lang,
                    collector_number,
                    scg_regular_id,
                    scg_foil_id,
                    scg_regular_prices,
                    scg_foil_prices,
                    set_name,
                }: CardType) => ({
                    name,
                    set,
                    set_name,
                    lang,
                    collector_number,
                    scg_regular_id,
                    scg_foil_id,
                    scg_regular_prices,
                    scg_foil_prices,
                })
            ),
        });
    });

    app.put('/storage/card', async (req, res) => {
        const { body } = req;
        console.log(`Upserting: ${body.name} ${body.id}`);
        await Card.findOneAndUpdate({ id: body.id }, body, { upsert: true });
        res.sendStatus(200);
    });

    app.put('/storage/card/update-ids', (req, res) => {
        const { body } = req;
        const { rows } = body as { rows: Partial<ParsedRow>[] };
        console.log('got: ', rows.length, ' rows');
        rows.forEach(async (row) => {
            const scgCard = parseScgCard(row);
            if (scgCard) {
                const doc = await Card.findOne({
                    set: scgCard.set,
                    collector_number: scgCard.collector_number,
                    lang: scgCard.lang,
                });
                if (doc) {
                    doc[`scg_${scgCard.foil ? 'foil' : 'regular'}_id`] = scgCard.scgId;
                    doc[`scg_${scgCard.foil ? 'foil' : 'regular'}_prices`] = scgCard.scgPrices;
                    await doc.save();
                } else {
                    console.log('Not found: ', row.meta);
                }
            }
        });
        return res.sendStatus(202);
    });
};

const scgSetsMap = {
    MF_2019: 'pf19',
    JDG_JGP: 'jgp',
    WC96: 'ptc',
    PLYR_P10: 'p10',
};

const parseScgCard = (card: Partial<ParsedRow>): PreparedScgCard => {
    const { meta, id, cards } = card;
    const [sgl, mtg, set, numString, langf] = meta.split('-');
    if (sgl !== 'SGL' || mtg !== 'MTG') {
        console.log('not single: ', meta);
        return null;
    }

    const [, lang, foilDigit] = langf.match(langRegexp) || [];
    const foil = foilDigit === 'F';

    const scgCard: Partial<PreparedScgCard> = {
        set: (scgSetsMap[set] || set).toLowerCase(),
        lang: lang.toLowerCase(),
        foil,
    };
    if (parseInt(numString, 10)) {
        scgCard.collector_number = numString.toLowerCase();
    } else {
        const [, customSet, colNum] = numString.match(numberRegexp) || [];
        if (customSet in scgSetsMap) {
            scgCard.set = scgSetsMap[customSet];
        }
        scgCard.collector_number = (parseInt(colNum, 10) || numString).toString().toLowerCase();
    }

    scgCard.scgId = id;
    scgCard.scgPrices = {
        updateTime: Date.now(),
        cards,
    };

    return scgCard as PreparedScgCard;
};

type PreparedScgCard = {
    set: string;
    lang: string;
    collector_number: string;
    scgId: number;
    scgPrices: ScgCardPrice;
    foil: boolean;
};
