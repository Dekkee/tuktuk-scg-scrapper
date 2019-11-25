import * as cheerio from 'cheerio';
import { ParsedRowDetails } from '../../entities/Row';
import { fillCardPrices, parseName } from './entities';

export type ScgGetResponse = { card: ParsedRowDetails };

export const parseScgGetAnswer = async (input: string): Promise<ScgGetResponse> => {
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

    // Set
    const setLink = dom(desc).find("[id='custom-field--Set']");
    const set = setLink.text().trim();

    // Mana Cost
    const manaCostElement = dom(desc).find("[id='custom-field--Mana Cost']");
    const manaCost = manaCostElement.text().trim();

    // Card Type
    const cardTypeElement = dom(desc).find("[id='custom-field--Card Type']");
    const cardType = cardTypeElement.text().trim();

    // Subtype
    const subtypeElement = dom(desc).find("[id='custom-field--Subtype']");
    const subtype = subtypeElement.text().trim();

    // Oracle Text
    const oracleTextElement = dom(desc).find("[id='custom-field--Oracle Text']");
    const oracleText = oracleTextElement.text().trim();

    // Flavor Text
    const flavorTextElement = dom(desc).find("[id='custom-field--Flavor Text']");
    const flavorText = flavorTextElement.text().trim();

    // Power / Toughness
    const ptElement = dom(desc).find("[id='custom-field--P/T']");
    const pt = ptElement.text().trim();

    // Artist
    const artistElement = dom(desc).find("[id='custom-field--Artist']");
    const artist = artistElement.text().trim();

    // Collector Number
    const collectorNumberElement = dom(desc).find("[id='custom-field--Collector Number']");
    const collectorNumber = collectorNumberElement.text().trim();

    // Rarity
    const rarityElement = dom(desc).find("[id='custom-field--Rarity']");
    const rarity = rarityElement.text().trim();

    // Image
    const imageContainer = dom(desc).find('.productView-image--default');
    const image = imageContainer.attr('data-src');

    const card: Partial<ParsedRowDetails> = {
        id,
        ...name,
        set,
        mana: manaCost,
        type: cardType,
        artist,
        oracleText,
        subtype,
        rarity,
        collectorNumber,
        pt,
        flavorText,
        image,
    };

    await fillCardPrices([card]);

    return { card: card as ParsedRowDetails };
};
