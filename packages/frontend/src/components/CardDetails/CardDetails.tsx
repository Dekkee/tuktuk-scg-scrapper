import * as React from 'react';
import * as cn from 'classnames';
import { ParsedRowDetails } from '../../../../common/Row';

import './CardDetails.scss';
import { Price } from '../Price';
import { MtgGoldfishGraph } from '../MtgGoldfishGraph';

interface Props {
    card: ParsedRowDetails;
}

export class CardDetails extends React.PureComponent<Props> {
    render() {
        const { card } = this.props;

        return (
            <article className="card-details">
                <div className="card-details__header">
                    <img className="card-details__img" src={card.image} alt={card.name} />
                </div>
                <div className="card-details__graph">
                    <MtgGoldfishGraph card={card} />
                </div>
                <div className="card-prices">
                    {card.cards && (
                        <div className="card-prices__container">
                            <b>Prices:</b>
                            <div className="card-prices__content">
                                {card.cards.map((card, index) => (
                                    <div className="card" key={index}>
                                        <div className="card__condition">{card.condition}</div>
                                        <div className="card__price">
                                            {/* todo: скидка */}
                                            {/*{*/}
                                            {/*    card.price && card.price.slice(0, -1).map((p, i) =>*/}
                                            {/*        <div className={ cn('card__discount') } key={ i }><Price value={p} /></div>)*/}
                                            {/*}*/}
                                            {card.price && <Price className="card__price-total" value={card.price} />}
                                            {isNaN(Number(card.stock)) && (
                                                <div className="card__stock">{card.stock}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="card-details__content">
                    <div className="card-details__set">
                        <b>Set: </b>
                        {card.set}
                    </div>
                    <div className="card-details__card-type">
                        <b>Card type: </b>
                        {card.type}
                    </div>
                    {card.creatureType && (
                        <div className="card-details__card-type">
                            <b>Creature type: </b>
                            {card.creatureType}
                        </div>
                    )}
                    <div className="card-details__casting-cost">
                        <b>Casting cost: </b>
                        {card.mana}
                    </div>
                    {card.pt && (
                        <div className="card-details__casting-cost">
                            <b>P/T: </b>
                            {card.pt}
                        </div>
                    )}
                    {card.cardText && (
                        <div className="card-details__text">
                            <b>Card text:</b>
                            {card.cardText}
                        </div>
                    )}
                    {card.oracleText && (
                        <div className="card-details__oracle">
                            <b>Oracle text:</b>
                            {card.oracleText}
                        </div>
                    )}
                    {card.flavorText && (
                        <div className="card-details__flavor">
                            <b>Flavor text:</b> {card.flavorText}{' '}
                        </div>
                    )}
                    {card.artist && (
                        <div className="card-details__artist">
                            <b>Artist:</b> {card.artist}{' '}
                        </div>
                    )}
                    {card.rarity && (
                        <div className="card-details__artist">
                            <b>Rarity:</b> {card.rarity}{' '}
                        </div>
                    )}
                </div>
            </article>
        );
    }
}
