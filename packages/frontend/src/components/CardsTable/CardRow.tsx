import * as React from 'react';
import * as cn from 'classnames';

import './CardRow.scss';
import { ParsedRow } from '../../../../common/Row';
import { Price } from '../Price';
import { RouteComponentProps, withRouter } from 'react-router';

export interface Props extends Partial<RouteComponentProps> {
    card: ParsedRow;
    className?: string;
}

@(withRouter as any)
export class CardRow extends React.PureComponent<Props> {
    render() {
        const { history } = this.props;
        const { name, set, cards, meta, foil, 'set-meta': setMeta, subtitle, url } = this.props.card;
        return (
            <>
                {cards.map(({ condition, price, stock, language }, i) => (
                    <tr key={i} onClick={() => history.push(`/card${url}`)}>
                        {i === 0 && (
                            <td rowSpan={cards.length} className="card-row__header">
                                <div className="card-row__name">
                                    {name}
                                    {subtitle && <span className="card-row__lang">{subtitle}</span>}
                                    {/*{foil && <span className="card-row__foil">Foil</span>}*/}
                                </div>
                                <div className="card-row__set">{set}</div>
                            </td>
                        )}
                        <td>
                            {stringToLangShort(language)} {condition}
                        </td>
                        <td className="card-row__price">
                            {price && <Price value={price} />}
                            {!stock && <div className="card-row__stock">Out of stock</div>}
                        </td>
                    </tr>
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
        case 'Spanish':
            flag = 'es';
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
        case 'Portuguese':
            flag = 'pt';
            break;
        case 'English':
            flag = 'us';
            break;
    }
    if (flag) {
        return <img src={`https://manage.hawksearch.com/sites/starcitygames/images/${flag.toString()}.png`} />;
    } else {
        return `(${langString})`;
    }
};
