import * as React from 'react';
import { useContext } from 'react';
import { SettingsContext } from '../../layout/SettingsContext';

import './Price.scss';

const priceRe = /\$\s*([\.\d]+)$/;
const ruTemplate = '{price} \u20bd';

export interface Props {
    value: string;
    className?: string;
}

export const Price = ({ value, className }: Props) => {
    const [settings] = useContext(SettingsContext);
    let formattedPrice = value;

    if (settings.rubleCourse > 0) {
        const [, parsedPrice] = value.match(priceRe) || [];
        formattedPrice = ruTemplate.replace(/{price}/, (parseFloat(parsedPrice) * settings.rubleCourse).toFixed());
        return <div className={className}>
            <div>{value}</div>
            <div className="secondary-price">{formattedPrice}</div>
        </div>
    }

    return (
        <div className={className}>{formattedPrice}</div>
    );
};
