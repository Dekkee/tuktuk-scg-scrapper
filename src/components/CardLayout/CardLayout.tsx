import * as React from 'react';
import * as cn from 'classnames';

import './CardLayout.scss';
import { ParsedRow } from "../../entities/Row";

export interface IProps {
    card: ParsedRow,
    className?: string,
}

export class CardLayout extends React.PureComponent<IProps & { key: number }> {
    render () {
        const { name, set, cards } = this.props.card;
        const { className } = this.props;
        return <div className={ cn("card-layout", className) }>
            <span className="card-layout__header"
                  style={ { gridRow: `1 / span ${cards.length}` } }>{ name.value }</span>
            <span style={ { gridRow: `1 / span ${cards.length}` } }>{ set.value }</span>
            {
                cards.map((card, i) => <React.Fragment key={i}>
                        <span>{ card.condition.value }</span>
                        <span>{ card.rarity }</span>
                        <span>{ card.price }</span>
                    </React.Fragment>)
            }
        </div>;
    }
}
