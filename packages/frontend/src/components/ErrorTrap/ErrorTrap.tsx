import * as React from 'react';
import { Button } from '../Button';
import ErrorIcon from '../../icons/error.svg';

import './ErrorTrap.scss';

export interface Props {
}

interface State {
    error?: Error;
}

export class ErrorTrap extends React.PureComponent<Props, State> {
    constructor (props) {
        super(props);

        this.state = {};
    }

    static getDerivedStateFromError (error) {
        return { error };
    }

    onReloadClicked () {
        localStorage.setItem('config', JSON.stringify({}));
        location.reload(true);
    }

    render () {
        const { children } = this.props;
        const { error } = this.state;

        return (
            error
                ? <div className="error-trap error-trap__container">
                    <ErrorIcon width={100} height={100}/>
                    <div className="error-trap__text">Something goes wrong! <br/>
                        Contact <a href="mailto:dekker25@gmail.com">xXx_$@$h@K_xXx</a> <br/>
                        { error.name }: { error.message }</div>
                    <Button className="error-trap__button" label="Reload" onClick={ () => this.onReloadClicked() }
                            width={ 300 }/>
                </div>
                : children
        );
    }
}
