import * as cheerio from 'cheerio';
import { ParsedRowDetails } from '@tuktuk-scg-scrapper/common/Row';
import { fillCardPrices, parseMeta } from './entities';
import { parseCondition } from './list';
import { GetResponse } from '@tuktuk-scg-scrapper/common/Response';

const productRegex = /context\s=\s(.*)/;

export type ConditionOption = { value: number; condition: string };

export type ParsedProductPage = {
    card: Partial<ParsedRowDetails>;
    attributeKey: number;
    options: ConditionOption[];
};

// Чистый разбор продуктовой страницы SCG (без сети) — отдельно от прайс-филла,
// чтобы тестироваться на фикстуре.
export const parseScgProductPage = (input: string): ParsedProductPage | null => {
    const [, productString] = input.match(productRegex) || [];

    const context = JSON.parse(eval(productString));
    const product = context.productCustomFields;

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

    // id: тема SCG 2026-07 убрала data-entity-id с .productView,
    // но тот же id лежит в inline context JSON
    const id = +context.productId;

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

    // Ключ атрибута и value-id кондиций меняются со временем — берём со страницы,
    // а не хардкодим (csrf_token из BCData исчез, remote/v1 работает без него)
    let attributeKey = 0;
    const options: ConditionOption[] = [];
    dom('.form-option-wrapper').each((_, el) => {
        const radio = dom(el).find('input.form-radio');
        const keyMatch = (radio.attr('name') || '').match(/attribute\[(\d+)\]/);
        if (keyMatch) {
            attributeKey = +keyMatch[1];
        }
        const value = +(
            dom(el).find('label.form-option').attr('data-product-attribute-value') ||
            radio.attr('value') ||
            0
        );
        const condition = dom(el).find('.form-option-variant').text().trim();
        if (value && condition) {
            options.push({ value, condition: parseCondition(condition) });
        }
    });

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

    return { card, attributeKey, options };
};

export const parseScgGetAnswer = async (input: string, cookies: string): Promise<GetResponse> => {
    const parsedPage = parseScgProductPage(input);

    if (!parsedPage) {
        return null;
    }

    const { card, attributeKey, options } = parsedPage;

    await fillCardPrices([card], cookies, attributeKey, options);

    return { card: card as ParsedRowDetails };
};
