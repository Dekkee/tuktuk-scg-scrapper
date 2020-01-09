import * as cheerio from 'cheerio';
import { ParsedRow } from '@tuktuk-scg-scrapper/common/Row';
import { fillCardPrices, parseName, parseSet } from './entities';
import { Paging } from '@tuktuk-scg-scrapper/common/Paging';

export const parseScgListAnswer = async (input: string) => {
    const dom = cheerio.load(input);
    const rows = dom('.productList table tr');
    const parsedRows = [];
    if (rows.length > 1) {
        rows.each((index, row) => {
            const id = +row.attribs['data-id'];
            if (id) {
                const card = parseRow(row);
                card.id = id;
                parsedRows.push(card);
            }
        });
    }
    await fillCardPrices(parsedRows);
    return {
        rows: parsedRows,
        ...parsePages(dom('.pagination .pagination-list')),
    };
};

const parseRow = (row: CheerioElement): Partial<ParsedRow> => {
    const $ = cheerio.load(row);
    return {
        ...parseName($('.--Name .listItem-title a').text()),
        ...parseSet($('.--Condition .category-row-name-search').text()),
        rarity: $('.--Rarity p')
            .children()
            .remove()
            .end()
            .text(),
        color: $('.--Color p')
            .children()
            .remove()
            .end()
            .text(),
    };
};

const parsePages = (element: Cheerio): Paging => {
    const links = element.find('.pagination-item');
    let pageCount = 1;
    let currentPage = 1;
    links.each((index, link) => {
        const page = parseInt(
            cheerio
                .load(link)('.pagination-link')
                .text()
        );
        if ((link.attribs['class'] || '').includes('pagination-item--current'))
            currentPage = page;
        if (page > pageCount) pageCount = page;
    });
    return { page: currentPage, pageCount };
};
