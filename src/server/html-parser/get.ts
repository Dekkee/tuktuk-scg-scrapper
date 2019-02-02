import * as cheerio from 'cheerio';
import { ParsedRowDetails } from '../../entities/Row';

export type ScgGetResponse = { card: ParsedRowDetails };

export const parseScgGetAnswer = (input: string): ScgGetResponse => {
    const dom = cheerio.load(input);
    const desc = dom('.card_desc_details');

    // Name
    const nameContainer = dom('#content table tbody tr td h2');
    const name = nameContainer.text();

    // Set
    const setLink = dom(desc).find('div div h3 a');
    const setValue = setLink.text().trim();
    const setHref = setLink.attr('href');

    // Content
    const cardContent = {};
    const contentContainer = dom(desc).find('div div:last-child');
    if (contentContainer.length > 1) {
        let coursor;
        contentContainer.contents().each((index, row) => {
            const $row = dom(row);
            const text = $row.text().trim();
            switch (row.tagName && row.tagName.toLowerCase()) {
                case 'strong':
                    if (text in rowsMap) {
                        coursor = text;
                        switch (rowsMap[ coursor ].type) {
                            case 'cost':
                            case 'string':
                                cardContent[ rowsMap[ coursor ].name ] = '';
                                break;
                            case 'remindable':
                                cardContent[ rowsMap[ coursor ].name ] = { text: '', reminder: '' };
                                break;
                        }
                    } else {
                        coursor = undefined;
                    }
                    break;
                case 'i':
                    if (coursor) {
                        switch (rowsMap[ coursor ].type) {
                            case 'remindable':
                                cardContent[ rowsMap[ coursor ].name ].reminder += text;
                                break;
                            case 'cost':
                                const c = $row.attr('class');
                                const match = c.match(/ms-(\w)\s/);
                                if (match) {
                                    cardContent[ rowsMap[ coursor ].name ] += match[ 1 ].toUpperCase();
                                }
                                break;
                        }

                    }
                    break;
                case null:
                    if (coursor) {
                        if (rowsMap[ coursor ].type === 'remindable') {
                            cardContent[ rowsMap[ coursor ].name ].text += text;
                        } else {
                            cardContent[ rowsMap[ coursor ].name ] += text;
                        }
                    }
                    break;
            }
        });
    }

    // Image
    const imageContainer = dom('.product_image_container');
    const image = imageContainer.find('img').attr('src');

    // Articles
    const articlesArray = [];
    const articles = imageContainer.parent().find('.articletext');
    articles.each((index, article) => {
        const articleObject = {};
        dom(article).contents().each((index, row) => {
            const text = dom(row).text();
            for (let field of articleFieldsArray) {
                if (field.reg.test(text)) {
                    articleObject[ field.name ] = field.getter(dom(row));
                }
            }
        });
        articlesArray.push(articleObject);
    });

    return {
        card: {
            name: { value: name, img: image },
            set: { value: setValue, href: setHref }, ...cardContent,
            cards: articlesArray
        }
    };
};

const rowsMap = {
    'Card Type:': { name: 'type', type: 'string' },
    'Casting Cost:': { name: 'mana', type: 'cost' },
    'Card Text:': { name: 'cardText', type: 'remindable' },
    'Oracle Text:': { name: 'oracleText', type: 'remindable' },
    'Artist:': { name: 'artist', type: 'string' },
    'Rarity:': { name: 'rarity', type: 'string' },
    'Loyalty:': { name: 'loyalty', type: 'string' },
    'Subtype:': { name: 'subtype', type: 'string' },
    'Flavor Text:': { name: 'flavorText', type: 'string' },
    'Power/Toughness:': { name: 'pt', type: 'string' },
    'Creature Type:': { name: 'creatureType', type: 'string' },
};

const articleFieldsArray = [
    { name: 'condition', reg: /^Condition:\s$/, getter: (el) => el.next().text() },
    {
        name: 'stock', reg: /(in|of)\sstock/i, getter: (el) => {
            const text = el.text();
            return /out\sof\sstock/i.test(text) ? 'Out of stock' : (text.match(/(\d+)\sin\sstock/) || [])[ 1 ];
        }
    },
    {
        name: 'price', reg: /^Price:\s/, getter: (el) => {
            const match = (el.text().match(/(\$\d+\.\d+)/g) || []);
            const prices = [match[0]];
            if (Boolean(match[1])) {
                prices.push(match[1]);
            }
            return prices;
        }
    }
];
