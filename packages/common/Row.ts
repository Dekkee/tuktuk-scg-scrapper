export interface RowHeader {
    id: number;
    name: string;
    meta: string;
    set: string;
    rarity: string;
    color: string;
    foil: boolean;
}

export interface ConditionAndPrice {
    condition: string;
    price: number;
    stock: number;
}

export interface RowBody {
    mana: string;
    type: string;
    pt: string;
    cardText: string;
    oracleText: string;
    artist: string
    subtype: string;
    flavorText: string;
    creatureType: string;
    rarity?: string;
    collectorNumber?: string;
    image: string;
}

export type RawRow = Partial<RowHeader> & Partial<RowBody>;
export type ParsedRow = Partial<RowHeader> & { cards: Partial<ConditionAndPrice>[] };
export type ParsedRowDetails = Partial<RowHeader> & Partial<RowBody> & { cards: Partial<ConditionAndPrice>[] };
