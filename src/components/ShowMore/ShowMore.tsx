import * as React from 'react';

import { Button } from '../Button';
import './ShowMore.scss';

export interface Props {
    onMoreRequested: VoidFunction;
}

export const ShowMore = ({ onMoreRequested }: Props) => <div className="show-more__container">
    <Button className="show-more__button" onClick={ () => onMoreRequested() } label="Show more"/>
</div>;
