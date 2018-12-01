import * as React from 'react';
import { ChangeEvent } from 'react';

import './SearchInput.scss';

export interface Props {
    onTextChanged: (text: string) => void;
}

export class SearchInput extends React.PureComponent<Props> {
    constructor (props) {
        super(props);
    }

    onInput = (e: ChangeEvent) => this.props.onTextChanged((e.target as HTMLInputElement).value);

    render () {
        return (
            <div className="search-container">
                <div className="search-panel">
                    <div className="search-input">
                        <input onChange={ (e) => this.onInput(e) } id="search-input" required/>
                        <div className="search-label">
                            <label htmlFor="search-input" className="search-label--placeholder">Search</label>
                        </div>
                    </div>
                    <div className="search-button">
                        <div className="search-button--icon">
                            <i className="icon-search"/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
