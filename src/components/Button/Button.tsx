import * as React from 'react';
import * as cn from 'classnames';

import './Button.scss';

export interface Props {
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
    label: string;
    className?: string;
};

export const Button = ({ onClick, label, className }: Props) => <div className="button__container">
    <button className={cn("button__button", className)} onClick={ (e) => onClick(e) }>{label}</button>
</div>;
