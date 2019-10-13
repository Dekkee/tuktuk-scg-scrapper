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
                <div className="card-layout__name">{ name.value }</div>
                <div className="card-layout__set">{ set.value }</div>
            </Link>
            {
                cards.map(({ condition, price, stock }, i) => <React.Fragment key={ i }>
                        <span>{ condition.value }</span>
                        <span className="card-layout__price">
                        {
                            price && price.slice(0, -1).map((p, i) =>
                                <div className={ cn('card-layout__discount') } key={ i }>{ p }</div>)
                        }
                            <div>{ price && price[price.length - 1] }</div>
                            { isNaN(Number(stock)) && <div className="card-layout__stock">{ stock }</div> }
                    </span>
                    </React.Fragment>
                )
            }
        </>;
    }
}
