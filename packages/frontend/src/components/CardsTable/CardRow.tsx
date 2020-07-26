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
        const { name, set, cards, meta, foil, 'set-meta': setMeta, subtitle, url } = this.props.card;
        return (
            <>
                <Link to={`/card${url}`} className="card-row__header" style={{ gridRow: `span ${cards.length}` }}>
                    <div className="card-row__name">
                        {name}
                        {subtitle && <span className="card-row__lang">{subtitle}</span>}
                        {/*{foil && <span className="card-row__foil">Foil</span>}*/}
                    </div>
                    <div className="card-row__set">{set}</div>
                </Link>
                {cards.map(({ condition, price, stock, language }, i) => (
                    <React.Fragment key={i}>
                        <span>{stringToLangShort(language)} {condition}</span>
                        <span className="card-row__price">
                            {price && <Price value={price} />}
                            {!stock && <div className="card-row__stock">Out of stock</div>}
                        </span>
                    </React.Fragment>
                ))}
            </>
        );
    }
}

const stringToLangShort = (langString: string) => {
    let flag = null;
    switch (langString) {
        case 'Korean':
            flag = 'kr';
            break;
        case 'Japanese':
            flag = 'jp';
            break;
        case 'Chinese - Simplified':
            flag = 'cn';
            break;
        case 'Chinese - Traditional':
            flag = 'tw';
            break;
        case 'Italian':
            flag = 'it';
            break;
        case 'French':
            flag = 'fr';
            break;
        case 'German':
            flag = 'de';
            break;
        case 'Russian':
            flag = 'ru';
            break;
        case 'English':
            flag = 'us';
            break;
    }
    if (flag) {
        return <img src={`https://manage.hawksearch.com/sites/starcitygames/images/${flag.toString()}.png`}/>
    } else {
        return `(${langString})`;
    }
}
