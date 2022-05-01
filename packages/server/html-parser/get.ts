import * as cheerio from 'cheerio';
import { ParsedRowDetails } from '@tuktuk-scg-scrapper/common/Row';
import { fillCardPrices, parseMeta } from './entities';
import { GetResponse } from '@tuktuk-scg-scrapper/common/Response';

const productRegex = /context\s=\s(.*)/;
const csrfRegex = /var\sBCData\s=\s\{\"csrf_token\":\"(\w+)\".*\"selected_attributes\":\{\"(\d+)\"/;

export const parseScgGetAnswer = async (input: string, cookies: string): Promise<GetResponse> => {
    const [, productString] = input.match(productRegex) || [];
    
    const product = JSON.parse(eval(productString)).productCustomFields;

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
    const name = nameContainer.text().trim();

    // Meta 
    const metaContainer = dom('.product-option-container');
    const dataSelectedSku = metaContainer.attr('data-selected-sku');
    const meta = parseMeta(dataSelectedSku);

    // Image
    const imageContainer = dom(desc).find('.productView-image--default');
    const image = imageContainer.attr('srcset');

    const [, csrfToken, attribute] = input.match(csrfRegex) || [];

    const card: Partial<ParsedRowDetails> = {
        id,
        name,
        meta,
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

    await fillCardPrices([card], csrfToken, cookies, parseInt(attribute, 10));

    return { card: card as ParsedRowDetails };
};
