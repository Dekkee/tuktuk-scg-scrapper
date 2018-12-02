import * as React from 'react';

import './ShowMore.scss';

export interface Props {
    onMoreRequested: VoidFunction;
}

export const ShowMore = ({ onMoreRequested }: Props) => <div className="show-more__container">
    <div className="show-more__button" onClick={ () => onMoreRequested() }>Show more</div>
</div>;
