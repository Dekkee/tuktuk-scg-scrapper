import { Schema, Document, model } from 'mongoose';
import { Card as CardType } from '../types';

const cardFaceSchema = {
    object: { type: String, required: true },
    name: { type: String, required: true },
    mana_cost: { type: String, required: true },
    type_line: { type: String, required: true },
    oracle_text: { type: String, required: true },
    artist: { type: String },
    artist_id: { type: String },
    illustration_id: { type: String },
    watermark: { type: String },
    power: { type: String },
    toughness: { type: String },
    colors: [{ type: String }],
    flavor_text: { type: String },
    image_uris: {
        small: { type: String, required: true },
        normal: { type: String, required: true },
        large: { type: String, required: true },
        png: { type: String, required: true },
        art_crop: { type: String, required: true },
        border_crop: { type: String, required: true },
    },
    printed_name: { type: String },
    printed_type_line: { type: String },
    printed_text: { type: String },
    loyalty: { type: String },
};

const scgPrice = {
    updateTime: Number,
    cards: [
      {
        condition: String,
        price: Number,
        stock: Number,
        purchasing_disabled: Boolean,
      },
    ],
  };

type CardSchemaType = CardType & Document;

const CardSchema: Schema = new Schema(
    {
        id: { type: String, required: true, unique: true },
        oracle_id: { type: String, required: true },
        multiverse_ids: { type: [Number], required: true },
        name: { type: String, required: true, index: true },
        lang: { type: String, required: true },
        released_at: { type: String, required: true },
        uri: { type: String, required: true },
        scryfall_uri: { type: String, required: true },
        layout: { type: String, required: true },
        highres_image: { type: Boolean, required: true },
        mana_cost: { type: String },
        cmc: { type: Number, required: true },
        type_line: { type: String, required: true },
        oracle_text: { type: String },
        colors: { type: [String] },
        color_identity: { type: [String], required: true },
        games: { type: [String], required: true },
        reserved: { type: Boolean, required: true },
        foil: { type: Boolean, required: true },
        nonfoil: { type: Boolean, required: true },
        oversized: { type: Boolean, required: true },
        promo: { type: Boolean, required: true },
        reprint: { type: Boolean, required: true },
        variation: { type: Boolean, required: true },
        set: { type: String, required: true, index: true },
        set_name: { type: String, required: true },
        set_type: { type: String, required: true },
        set_uri: { type: String, required: true },
        set_search_uri: { type: String, required: true },
        scryfall_set_uri: { type: String, required: true },
        rulings_uri: { type: String, required: true },
        prints_search_uri: { type: String, required: true },
        collector_number: { type: String, required: true },
        digital: { type: Boolean, required: true },
        rarity: { type: String, required: true },
        card_back_id: { type: String, required: true },
        artist: { type: String, required: true },
        artist_ids: { type: [String] },
        illustration_id: { type: String, required: true },
        border_color: { type: String, required: true },
        frame: { type: String, required: true },
        full_art: { type: Boolean, required: true },
        textless: { type: Boolean, required: true },
        booster: { type: Boolean, required: true },
        story_spotlight: { type: Boolean, required: true },
        edhrec_rank: { type: Number },
        power: { type: String },
        toughness: { type: String },
        promo_types: { type: [String] },
        tcgplayer_id: { type: Number },
        loyalty: { type: String },
        printed_name: { type: String },
        flavor_name: { type: String },
        frame_effects: { type: [String] },
        printed_type_line: { type: String },
        printed_text: { type: String },
        flavor_text: { type: String },
        variation_of: { type: String },
        mtgo_id: { type: Number },
        watermark: { type: String },
        color_indicator: { type: [String] },
        arena_id: { type: Number },
        life_modifier: { type: String },
        hand_modifier: { type: String },
        mtgo_foil_id: { type: String },
        image_uris: {
            small: { type: String, required: true },
            normal: { type: String, required: true },
            large: { type: String, required: true },
            png: { type: String, required: true },
            art_crop: { type: String, required: true },
            border_crop: { type: String, required: true },
        },
        legalities: {
            standard: { type: String, required: true },
            future: { type: String, required: true },
            historic: { type: String, required: true },
            pioneer: { type: String, required: true },
            modern: { type: String, required: true },
            legacy: { type: String, required: true },
            pauper: { type: String, required: true },
            vintage: { type: String, required: true },
            penny: { type: String, required: true },
            commander: { type: String, required: true },
            brawl: { type: String, required: true },
            duel: { type: String, required: true },
            oldschool: { type: String, required: true },
        },
        related_uris: {
            tcgplayer_decks: { type: String, required: true },
            edhrec: { type: String, required: true },
            mtgtop8: { type: String, required: true },
            gatherer: { type: String },
        },
        all_parts: {
            type: [
                {
                    object: { type: String, required: true },
                    id: { type: String, required: true },
                    component: { type: String, required: true },
                    name: { type: String, required: true },
                    type_line: { type: String, required: true },
                    uri: { type: String, required: true },
                },
            ],
        },
        preview: {
            source: { type: String },
            source_uri: { type: String },
            previewed_at: { type: String },
        },
        card_faces: [cardFaceSchema],
        scg_regular_id: { type: Number },
        scg_foil_id: { type: Number },
        scg_regular_prices: scgPrice,
        scg_foil_prices: scgPrice,
    },
    {
        toObject: {
            transform: function (doc, ret) {
                //delete ret._id;
                delete ret.__v;
            },
        },
        toJSON: {
            transform: function (doc, ret) {
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

export const Card = model<CardSchemaType>('Card', CardSchema);
