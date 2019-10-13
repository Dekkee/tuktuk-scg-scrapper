import * as React from 'react';
import SpinnerIcon from '../../icons/spinner.svg';

import './LoadingLabel.scss';

export const LoadingLabel = () => <div className="loading__container">
    <SpinnerIcon width={50} height={50}/>Loading
</div>;
