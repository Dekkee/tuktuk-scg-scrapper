import { ScgPriceAndCondition } from '@tuktuk-scg-scrapper/storage/types';

export type Meta = string | Record<string, any>;

export interface RowHeader {
    id: number;
    name: string;
    subtitle: string;
    meta?: Meta;
    set: string;
    rarity?: string;
    color?: string;
    foil: boolean;
    'set-meta'?: string;
    lang?: string;
    url: string;
}

export interface RowBody {
    mana: string;
    type: string;
    pt: string;
    cardText: string;
    oracleText: string;
    artist: string;
    subtype: string;
    flavorText: string;
    creatureType: string;
    rarity?: string;
    collectorNumber?: string;
    image: string;
}

export type RawRow = Partial<RowHeader> & Partial<RowBody>;
export type ParsedRow = Partial<RowHeader> & {
    cards: ScgPriceAndCondition[];
};
export type ParsedRowDetails = Partial<RowHeader> & Partial<RowBody> & { cards: ScgPriceAndCondition[] };
