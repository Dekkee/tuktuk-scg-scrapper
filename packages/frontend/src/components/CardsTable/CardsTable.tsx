import * as React from 'react';
import * as cn from 'classnames';
import { ParsedRow } from '../../../../common/Row';
import { CardRow } from './CardRow';
import SearchIcon from '../../icons/search.svg';
import ErrorIcon from '../../icons/error.svg';

import './CardsTable.scss';

export interface Props {
    rows: ParsedRow[];
}

const renderCards = (rows: ParsedRow[]) => (
    <table className="cards-container">
        {rows.map((row, i) => (
            <tbody key={i}>
                <CardRow className={cn({ 'card-layout--dark': i % 2 })} card={row} />
                {i < rows.length - 1 && (
                    <tr className="row-separator">
                        <td colSpan={3} />
                    </tr>
                )}
            </tbody>
        ))}
    </table>
);

const renderNotFound = () => (
    <div className="empty-container">
        <div className="empty">
            <ErrorIcon width={50} height={50} />
            Not found
        </div>
    </div>
);

const renderStartSearch = () => (
    <div className="start-search-container">
        <div className="start-search">
            <SearchIcon width={50} height={50} />
            Start search!!!
        </div>
    </div>
);

export const CardsTable = ({ rows }: Props) =>
    rows ? (rows.length ? renderCards(rows) : renderNotFound()) : renderStartSearch();
