import * as React from 'react';
import * as cn from 'classnames';

import './SearchInput.scss';
import { AutocompleteCard } from '../../entities/AutocompleteCard';
import { ChangeEvent } from 'react';
import { Autocomplete } from './Autocomplete';

export interface Props {
    onTextChanged: (text: string) => void;
    onSearchRequested: (text: string, isAutocomplete: boolean) => void;
    autocompletion?: Record<string, AutocompleteCard>;
    text?: string;
}

export class SearchInput extends React.PureComponent<Props> {
    private inputRef: React.RefObject<HTMLInputElement>;

    constructor (props) {
        super(props);

        this.inputRef = React.createRef();
    }

    private onInput = (e: ChangeEvent) => {
        const { value } = e.target as HTMLInputElement;
        this.setState({ ...this.state, ...{ text: value } });
        this.props.onTextChanged(value);
    };

    private onKeyPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { autocompletion, text } = this.props;

        switch (e.key) {
            case 'Enter':
                this.handleSearchRequest(text);
                break;
            case 'ArrowDown':
            case 'ArrowUp':
                if (autocompletion) {
                    this.inputRef.current.blur();
                    e.preventDefault();
                }
                break;
        }
    };

    private handleSearchRequest = (text: string) => {
        this.props.onSearchRequested(text, false);
    };

    private onAutocomplete = (text: string) => {
        this.setState({ ...this.state, text });
        this.props.onSearchRequested(text, true);
    };

    private onClear = () => {
        this.setState({ ...this.state, text: '' });
        this.inputRef.current.focus();
    };

    render () {
        const { autocompletion, text } = this.props;
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
                        <input value={ text }
                               onChange={ (e) => this.onInput(e) }
                               onKeyDown={ (e) => this.onKeyPressed(e) }
                               id="search-input"
                               ref={ this.inputRef }
                               required/>
                        <div className="search-label">
                            <div className="search-label--placeholder">Search</div>
                        </div>
                    </label>
                    { <div className={ cn('search-cross', { 'search-cross--hidden': !Boolean(text) }) }
                           onClick={ () => this.onClear() }>&times;</div> }
                    <button className="search-button" onClick={ () => this.handleSearchRequest(text) }>
                        <div className="search-button--icon">
                            <i className="icon-search"/>
                        </div>
                    </button>
                </div>
                {
                    Boolean(text) && aucompleteCards.length > 0 &&
                    <Autocomplete onAutocomplete={ this.onAutocomplete.bind(this) } cards={ aucompleteCards }/>
                }
            </div>
        );
    }
}
