import * as React from 'react';
import { ChangeEvent, KeyboardEvent } from 'react';

import './SearchInput.scss';

export interface Props {
    // onTextChanged: (text: string) => void;
    onSearchRequested: (text: string) => void;
}

interface State {
    text: string;
}

export class SearchInput extends React.PureComponent<Props, State> {
    constructor (props) {
        super(props);

        this.state = {
            text: ''
        };
    }

    onInput = (e: ChangeEvent) => this.setState({
        ...this.state,
        ...{ text: (e.target as HTMLInputElement).value }
    });

    onKeyPressed = (e) => {
        if ((e as KeyboardEvent).key === 'Enter') {
            this.handleSearchRequest(this.state.text);
        }
    };

    handleSearchRequest = (text: string) => {
        this.props.onSearchRequested(text);
    };

    render () {
        return (
            <div className="search-container">
                <div className="search-panel">
                    <label className="search-input" htmlFor="search-input">
                        <input onChange={ (e) => this.onInput(e) } onKeyPress={ (e) => this.onKeyPressed(e) }
                               id="search-input" required/>
                        <div className="search-label">
                            <div className="search-label--placeholder">Search</div>
                        </div>
                    </label>
                    <button className="search-button" onClick={ () => this.handleSearchRequest(this.state.text) }>
                        <div className="search-button--icon">
                            <i className="icon-search"/>
                        </div>
                    </button>
                </div>
            </div>
        );
    }
}
