import * as React from 'react';
import * as cn from 'classnames';
import { ParsedRow } from '../../entities/Row';
import { Card } from './Card';

import './CardsLayout.scss';

export interface Props {
    rows: ParsedRow[]
}

const renderCards = (rows: ParsedRow[]) => (
    <div className="cards-container"> {
        rows.map((row, i) => <>
            { i > 0 && <div className="row-separator" key={ 2 * i }/> }
            <Card
                className={ cn({ 'card-layout--dark': i % 2 }) }
                card={ row }
                key={ 2 * i + 1 }/>
        </>) }
    </div>
);

const renderNotFound = () => (
    <div className="empty-container">
        <div className="empty"><i className="icon-sad icon-big"/>Not found</div>
    </div>
);

const renderStartSearch = () => (
    <div className="start-search-container">
        <div className="start-search"><i className="icon-search icon-big"/>Start search!!!</div>
    </div>
);

export const CardsLayout = ({ rows }: Props) => (
    rows
    ? rows.length
        ? renderCards(rows)
        : renderNotFound()
    : renderStartSearch()
);
