export type All_parts = {
    object: string;
    id: string;
    component: string;
    name: string;
    type_line: string;
    uri: string;
};

export type Card = {
    object: string;
    id: string;
    oracle_id: string;
    multiverse_ids: number[];
    name: string;
    lang: string;
    released_at: string;
    uri: string;
    scryfall_uri: string;
    layout: string;
    highres_image: boolean;
    image_uris?: Image_uris;
    mana_cost?: string;
    cmc: number;
    type_line: string;
    oracle_text?: string;
    colors?: string[];
    color_identity: string[];
    legalities: Legalities;
    games: string[];
    reserved: boolean;
    foil: boolean;
    nonfoil: boolean;
    oversized: boolean;
    promo: boolean;
    reprint: boolean;
    variation: boolean;
    set: string;
    set_name: string;
    set_type: string;
    set_uri: string;
    set_search_uri: string;
    scryfall_set_uri: string;
    rulings_uri: string;
    prints_search_uri: string;
    collector_number: string;
    digital: boolean;
    rarity: string;
    card_back_id: string;
    artist: string;
    artist_ids?: string[];
    illustration_id?: string;
    border_color: string;
    frame: string;
    full_art: boolean;
    textless: boolean;
    booster: boolean;
    story_spotlight: boolean;
    edhrec_rank?: number;
    related_uris: Related_uris;
    power?: string;
    toughness?: string;
    promo_types?: string[];
    tcgplayer_id?: number;
    loyalty?: string;
    all_parts?: All_parts[];
    printed_name?: string;
    flavor_name?: string;
    preview?: Preview;
    printed_type_line?: string;
    printed_text?: string;
    flavor_text?: string;
    variation_of?: string;
    frame_effects?: string[];
    mtgo_id?: number;
    card_faces?: Card_faces[];
    watermark?: string;
    color_indicator?: string[];
    arena_id?: number;
    life_modifier?: string;
    hand_modifier?: string;
    mtgo_foil_id?: number;
    scg_regular_id?: number;
    scg_foil_id?: number;
    scg_regular_prices?: ScgCardPrice;
    scg_foil_prices: ScgCardPrice;
};

export type ScgCardPrice = {
    updateTime: number;
    cards: ScgPriceAndCondition[];
};

export type ScgPriceAndCondition = {
    condition: string;
    price: number;
    stock: number;
    purchasing_disabled: boolean;
};

export type Card_faces = {
    object: string;
    name: string;
    mana_cost: string;
    type_line: string;
    oracle_text: string;
    artist?: string;
    artist_id?: string;
    illustration_id?: string;
    watermark?: string;
    power?: string;
    toughness?: string;
    colors?: string[];
    flavor_text?: string;
    image_uris?: Image_uris;
    printed_name?: string;
    printed_type_line?: string;
    printed_text?: string;
    loyalty?: string;
};

export type Image_uris = {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
};

export type Legalities = {
    standard: string;
    future: string;
    historic: string;
    pioneer: string;
    modern: string;
    legacy: string;
    pauper: string;
    vintage: string;
    penny: string;
    commander: string;
    brawl: string;
    duel: string;
    oldschool: string;
};

export type Preview = {
    source: string;
    source_uri: string;
    previewed_at: string;
};

export type Related_uris = {
    tcgplayer_decks: string;
    edhrec: string;
    mtgtop8: string;
    gatherer?: string;
};
