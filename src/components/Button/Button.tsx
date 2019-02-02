import * as React from 'react';
import * as cn from 'classnames';

import './Button.scss';

export interface Props {
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
    label: string;
    className?: string;
    width?: number;
};

export const Button = ({ onClick, label, className, width = 100 }: Props) => <div className="button__container">
    <button className={cn("button__button", className)} onClick={ (e) => onClick(e) } style={{width}}>{label}</button>
</div>;
