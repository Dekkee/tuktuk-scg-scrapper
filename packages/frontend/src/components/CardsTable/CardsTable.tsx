import * as React from 'react';
import * as cn from 'classnames';
import { ParsedRow } from '../../../../common/Row';
import { CardRow } from './CardRow';
import SearchIcon from '../../icons/search.svg';
import ErrorIcon from '../../icons/error.svg';

import './CardsTable.scss';

export interface Props {
    rows: ParsedRow[]
}

const renderCards = (rows: ParsedRow[]) => (
    <div className="cards-container"> {
        rows.map((row, i) => <React.Fragment key={i}>
            { i > 0 && <div className="row-separator"/> }
            <CardRow
                className={ cn({ 'card-layout--dark': i % 2 }) }
                card={ row } />
        </React.Fragment>) }
    </div>
);

const renderNotFound = () => (
    <div className="empty-container">
        <div className="empty"><ErrorIcon width={50} height={50}/>Not found</div>
    </div>
);

const renderStartSearch = () => (
    <div className="start-search-container">
        <div className="start-search"><SearchIcon width={50} height={50}/>Start search!!!</div>
    </div>
);

export const CardsTable = ({ rows }: Props) => (
    rows
    ? rows.length
        ? renderCards(rows)
        : renderNotFound()
    : renderStartSearch()
);
