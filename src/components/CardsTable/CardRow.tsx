import * as React from 'react';
import * as cn from 'classnames';

import './CardRow.scss';
import { ParsedRow } from '../../entities/Row';
import { Link } from 'react-router-dom';

export interface Props {
    card: ParsedRow,
    className?: string,
}

export class CardRow extends React.PureComponent<Props> {
    render () {
        const { name, set, cards } = this.props.card;
        const cardId = encodeURIComponent(name.href.match(/product\/(.*)$/)[1]);
        return <>
            <Link to={`/card/${cardId}`} className="card-layout__header"
                  style={ { gridRow: `span ${ cards.length }` } }>
                <div>{ name.value }</div>
                <div className="card-layout--set">{ set.value }</div>
            </Link>
            {
                cards.map((card, i) => <React.Fragment key={ i }>
                    <span>{ card.condition.value }</span>
                    <span>{ card.rarity }</span>
                    <span className="card-layout--price">
                        {
                            card.price && card.price.slice(0, -1).map((p, i) =>
                                <div className={ cn('card-layout__discount') } key={ i }>{ p }</div>)
                        }
                        <div>{ card.price && card.price.pop() }</div>
                        { isNaN(Number(card.stock)) && <div className="card-layout--stock">{ card.stock }</div> }
                    </span>
                </React.Fragment>)
            }
        </>;
    }
}
