export interface RowName {
    href: string;
    value: string;
    img: string;
}

export interface RowLink {
    href: string;
    value: string;
}

export interface RowHeader {
    name: Partial<RowName>;
    set: Partial<RowLink>;
}

export interface ReminableText {
    reminder?: string;
    text: string;
}

export interface ConditionAndPrice {
    condition: {
        href: string;
        value: string;
    };
    price: string[];
    rarity: string;
    stock: string;
}

export interface RowBody {
    mana: string;
    type: string;
    pt: string;
    cardText: ReminableText;
    oracleText: ReminableText;
    artist: string;
    loyalty: string;
    subtype: string;
    flavorText: string;
    creatureType: string;
    rarity?: string;
}

export type RawRow = Partial<RowHeader> & Partial<RowBody>;
export type ParsedRow = Partial<RowHeader> & { cards: Partial<ConditionAndPrice>[] };
export type ParsedRowDetails = Partial<RowHeader> & Partial<RowBody> & { cards: Partial<ConditionAndPrice>[] };
