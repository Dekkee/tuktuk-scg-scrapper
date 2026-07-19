import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseScgProductPage } from './get';

// Живая продуктовая страница SCG, снята 2026-07-19 (редизайн темы:
// .productView без data-entity-id, BCData без csrf_token). Регрессия DEK-194.
const fixture = fs.readFileSync(path.join(__dirname, '__fixtures__', 'scg-product-page-2026-07.html'), 'utf8');

describe('parseScgProductPage', () => {
    it('extracts card details from the redesigned page', () => {
        const parsed = parseScgProductPage(fixture);
        expect(parsed).not.toBeNull();
        const { card } = parsed!;
        expect(card.id).toBe(572042);
        expect(card.name).toContain('Lightning Bolt');
        expect(card.set).toBeTruthy();
        expect(card.oracleText).toContain('damage');
    });

    it('extracts attribute key and condition options from the page', () => {
        const { attributeKey, options } = parseScgProductPage(fixture)!;
        expect(attributeKey).toBe(563168);
        expect(options).toEqual([
            { value: 167970, condition: 'NM' },
            { value: 167971, condition: 'PL' },
            { value: 167972, condition: 'HP' },
        ]);
    });
});
