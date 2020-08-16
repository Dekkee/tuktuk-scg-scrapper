import * as cheerio from 'cheerio';
import { ParsedRowDetails } from '@tuktuk-scg-scrapper/common/Row';
import { fillCardPrices, parseName } from './entities';
import { GetResponse } from '@tuktuk-scg-scrapper/common/Response';

const productRegex = /scg\.product\.customFields\s=\s\{\};\s+(.*)\.forEach\(\(cf\)=>\{scg\.product\.customFields/;

export const parseScgGetAnswer = async (input: string): Promise<GetResponse> => {
    const [, productString] = input.match(productRegex) || [];
    const product = JSON.parse(productString.trim());

    const parsed: Record<string, string> = {};

    product.forEach((field) => {
        if (field.name.trim()) {
            parsed[field.name] = field.value;
        } else {
            parsed['Oracle Text'] += field.value;
        }
    });

    const dom = cheerio.load(input);
    const desc = dom('.productView');

    // id
    const id = +desc.attr('data-entity-id');

    if (!id) {
        return null;
    }

    // Name
    const nameContainer = dom('.mobile-product-title');
    const name = parseName(nameContainer.text());

    // Image
    const imageContainer = dom(desc).find('.productView-image--default');
    const image = imageContainer.attr('data-src');

    const card: Partial<ParsedRowDetails> = {
        id,
        ...name,
        set: parsed.Set,
        mana: parsed['Mana Cost'],
        type: parsed['Card Type'],
        artist: parsed.Artist,
        oracleText: parsed['Oracle Text'],
        subtype: parsed.Subtype,
        rarity: parsed.Rarity,
        collectorNumber: parsed['Collector Number'],
        pt: parsed['P/T'],
        flavorText: parsed['Flavor Text'],
        image,
    };

    await fillCardPrices([card]);

    return { card: card as ParsedRowDetails };
};
