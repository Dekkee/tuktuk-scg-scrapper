import * as React from 'react';
import { ChangeEvent, KeyboardEvent } from 'react';

import './SearchInput.scss';
import { AutocompleteCard } from '../../entities/AutocompleteCard';

export interface Props {
    onTextChanged: (text: string) => void;
    onSearchRequested: (text: string) => void;
    autocompletion?: Record<string, AutocompleteCard>;
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

    private onInput = (e: ChangeEvent) => {
        const { value } = e.target as HTMLInputElement;
        this.setState({ ...this.state, ...{ text: value } });
        this.props.onTextChanged(value);
    };

    private onKeyPressed = (e) => {
        if ((e as KeyboardEvent).key === 'Enter') {
            this.handleSearchRequest(this.state.text);
        }
    };

    private handleSearchRequest = (text: string) => {
        this.props.onSearchRequested(text);
    };

    private onAutocomplete = (text: string) => {
        this.setState({ ...this.state, text });
        this.props.onSearchRequested(text);
    };

    private onClear = () => this.setState({ ...this.state, text: '' });

    render () {
        const { autocompletion } = this.props;
        const { text } = this.state;
        let aucompleteCards: AutocompleteCard[] = [];
        if (autocompletion) {
            const keys = Object.keys(autocompletion);
            for (let key of keys) {
                aucompleteCards.push(autocompletion[ key ]);
            }
        }

        return (
            <div className="search-container">
                <div className="search-panel">
                    <label className="search-input" htmlFor="search-input">
                        <input value={ text } onChange={ (e) => this.onInput(e) } onKeyPress={ (e) => this.onKeyPressed(e) }
                               id="search-input" required/>
                        <div className="search-label">
                            <div className="search-label--placeholder">Search</div>
                        </div>
                    </label>
                    { Boolean(text) && <div className="search-cross" onClick={ () => this.onClear() }>&times;</div> }
                    <button className="search-button" onClick={ () => this.handleSearchRequest(this.state.text) }>
                        <div className="search-button--icon">
                            <i className="icon-search"/>
                        </div>
                    </button>
                </div>
                {
                    Boolean(text) && aucompleteCards.length > 0 && <div className="autocompletion">
                        {
                            aucompleteCards.map((card, i) =>
                                <div className="autocompletion--card" onClick={ () => this.onAutocomplete(card.name) }>
                                    <div className="autocompletion--card-name">{ card.name }</div>
                                    <div className="autocompletion--card-text">{ card.text }</div>
                                </div>)
                        }
                    </div>
                }
            </div>
        );
    }
}
