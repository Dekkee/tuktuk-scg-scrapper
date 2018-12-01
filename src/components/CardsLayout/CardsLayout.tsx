import * as React from 'react';
import * as cn from 'classnames';
import { ParsedRow } from '../../entities/Row';
import { Card } from './Card';

import './CardsLayout.scss';

export interface Props {
    rows: ParsedRow[]
}

export const CardsLayout = ({ rows }: Props) => {
    return (rows
        ? rows.length
            ? <div className="cards-container"> {
                rows.map((row, i) => <>
                    <Card
                        className={ cn({ 'card-layout--dark': i % 2 }) }
                        card={ row }
                        key={ i }/>
                    { i < rows.length - 1 && <div className="row-separator"/> }
                </>)
            }
            </div>
            : <div className="empty-container">
                <div className="empty"><i className="icon-sad icon-big"/>Not found</div>
            </div>
        : <div className="start-search-container">
            <div className="start-search"><i className="icon-search icon-big"/>Start search!!!</div>
        </div>);
};
