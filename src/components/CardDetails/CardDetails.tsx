import * as React from 'react';
import * as cn from 'classnames';
import { ParsedRowDetails } from '../../entities/Row';

import './CardDetails.scss';

interface Props {
    card: ParsedRowDetails;
}

export class CardDetails extends React.PureComponent<Props> {
    render () {
        const { card } = this.props;

        return (<div className="card-details">
            <div className="card-details__header">
                <div className="card-details__title">{ card.name.value }</div>
                <a className="card-details__set" href={ card.set.href }>{ card.set.value }</a>
                <img className="card-details__img" src={ card.name.img } alt={ card.name.value }/>
            </div>
            <div className="card-details__content">
                <div className="card-details__card-type"><b>Card type: </b>{ card.type }</div>
                {
                    card.creatureType &&
                    <div className="card-details__card-type"><b>Creature type: </b>{ card.creatureType }</div>
                }
                <div className="card-details__casting-cost"><b>Casting cost: </b>{ card.mana }</div>
                {
                    card.pt && <div className="card-details__casting-cost"><b>P/T: </b>{ card.pt }</div>
                }
                {
                    card.cardText && <div className="card-details__text">
                        <b>Card text:</b>
                        { card.cardText.reminder &&
                        <div className="card-details__text_reminder">{ card.cardText.reminder }</div> }
                        { card.cardText.text }
                    </div>
                }
                {
                    card.oracleText && <div className="card-details__oracle">
                        <b>Oracle text:</b>
                        { card.oracleText.reminder &&
                        <div className="card-details__oracle_reminder">{ card.oracleText.reminder }</div> }
                        { card.oracleText.text }
                    </div>
                }
                {
                    card.flavorText &&
                    <div className="card-details__flavor"><b>Flavor text:</b> { card.flavorText } </div>
                }
                {
                    card.artist &&
                    <div className="card-details__artist"><b>Artist:</b> { card.artist } </div>
                }
                {
                    card.rarity &&
                    <div className="card-details__artist"><b>Rarity:</b> { card.rarity } </div>
                }
                {
                    card.cards &&
                    <div className="card-details__prices-container">
                        <b>Prices:</b>
                        <div className="card-details__prices">
                            {
                                card.cards.map((card, index) => (
                                    <React.Fragment key={ index }>
                                        <div className="card__condition">{ card.condition }</div>
                                        <div className="card__price">
                                            {
                                                card.price && card.price.slice(0, -1).map((p, i) =>
                                                    <div className={ cn('card__discount') } key={ i }>{ p }</div>)
                                            }
                                            <div className="card__price-total">{ card.price && card.price.pop() }</div>
                                            { isNaN(Number(card.stock)) &&
                                            <div className="card__stock">{ card.stock }</div> }
                                        </div>
                                    </React.Fragment>))
                            }
                        </div>
                    </div>
                }
            </div>
        </div>);
    }
}
