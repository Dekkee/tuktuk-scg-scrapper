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

export interface RowBody {
    mana: string;
    type: string;
    pt: string;
    rarity: string;
    condition: {
        href: string;
        value: string;
    };
    stock: string;
    price: string[];
}

export type RawRow = Partial<RowHeader> & Partial<RowBody>;
export type ParsedRow = Partial<RowHeader> & { cards: Partial<RowBody>[] };
