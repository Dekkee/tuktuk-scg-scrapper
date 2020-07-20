import * as React from 'react';
import * as cn from 'classnames';

import './CardRow.scss';
import { ParsedRow } from '../../../../common/Row';
import { Link } from 'react-router-dom';
import { Price } from '../Price';

export interface Props {
    card: ParsedRow;
    className?: string;
}

export class CardRow extends React.PureComponent<Props> {
    render() {
        const { name, set, cards, meta, foil, 'set-meta': setMeta, lang } = this.props.card;
        const cardId = encodeURIComponent(`${name.replace(/[,\.]/g, '').replace(/\s/g, '-')}-${meta}`.toLowerCase());
        return (
            <>
                <Link to={`/card/${cardId}`} className="card-row__header" style={{ gridRow: `span ${cards.length}` }}>
                    <div className="card-row__name">
                        {name}
                        {lang && lang !== 'English' && <span className="card-row__lang">{lang}</span>}
                        {foil && <span className="card-row__foil">Foil</span>}
                    </div>
                    <div className="card-row__set">{set}</div>
                </Link>
                {cards.map(({ condition, price, stock }, i) => (
                    <React.Fragment key={i}>
                        <span>{condition}</span>
                        <span className="card-row__price">
                            {/* todo: скидки */}
                            {/*{*/}
                            {/*    price && price.slice(0, -1).map((p, i) =>*/}
                            {/*        <div className={ cn('card-row__discount') } key={ i }><Price value={p}/></div>)*/}
                            {/*}*/}
                            {price && <Price value={price} />}
                            {!stock && <div className="card-row__stock">Out of stock</div>}
                        </span>
                    </React.Fragment>
                ))}
            </>
        );
    }
}
