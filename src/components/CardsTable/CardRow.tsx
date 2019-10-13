import * as React from 'react';
import * as cn from 'classnames';

import './CardRow.scss';
import { ParsedRow } from '../../entities/Row';
import { Link } from 'react-router-dom';
import { Price } from '../Price';

export interface Props {
    card: ParsedRow,
    className?: string,
}

export class CardRow extends React.PureComponent<Props> {
    render () {
        const { name, set, cards } = this.props.card;
        const cardId = encodeURIComponent(name.href.match(/product\/(.*)$/)[1]);
        return <>
            <Link to={`/card/${cardId}`} className="card-row__header"
                  style={ { gridRow: `span ${ cards.length }` } }>
                <div className="card-row__name">{ name.value }</div>
                <div className="card-row__set">{ set.value }</div>
            </Link>
            {
                cards.map(({ condition, price, stock }, i) => <React.Fragment key={ i }>
                        <span>{ condition.value }</span>
                        <span className="card-row__price">
                        {
                            price && price.slice(0, -1).map((p, i) =>
                                <div className={ cn('card-row__discount') } key={ i }><Price value={p}/></div>)
                        }
                            { price && price[price.length - 1] ? <Price value={price[price.length - 1]}/> : null }
                            { isNaN(Number(stock)) && <div className="card-row__stock">{ stock }</div> }
                    </span>
                    </React.Fragment>
                )
            }
        </>;
    }
}
