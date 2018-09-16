import * as React from 'react';
import { ChangeEvent } from "react";

import './SearchInput.scss';

export interface Props {
    onTextChanged: (text: string) => void;
}

export class SearchInput extends React.PureComponent<Props> {
    constructor(props) {
        super(props);
    }

    onInput = (e: ChangeEvent) => this.props.onTextChanged((e.target as HTMLInputElement).value);

    render() {
        return (
            <div className="search-container">
                <input onChange={(e) => this.onInput(e)} className="search-input" id="search-input" required />
                <label htmlFor="search-input" className="search-label">Search</label>
            </div>
        );
    }
}
