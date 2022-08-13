import * as React from 'react';
import { ChangeEvent } from 'react';
import * as cn from 'classnames';

import './SearchInput.scss';
import { AutocompleteCard } from '../../../../common/AutocompleteCard';
import { Autocomplete } from './Autocomplete';
import { debounce } from '../../utils/debounce';
import { autocomplete } from '../../api';

import SearchIcon from '../../icons/search.svg';

export interface Props {
    onSearchRequested: (text: string, isAutocomplete: boolean) => void;
    initialText?: string;
}

interface State {
    autocompletion?: Record<string, AutocompleteCard>;
    text?: string;
}

export class SearchInput extends React.PureComponent<Props, State> {
    private readonly onTextChangedDebounced: ReturnType<typeof debounce>;

    private inputRef: React.RefObject<HTMLInputElement>;

    constructor(props) {
        super(props);

        this.inputRef = React.createRef();

        this.state = {
            text: props.initialText,
        };

        this.onTextChangedDebounced = debounce(async (value: string) => {
            if (!value) {
                this.setState({ ...this.state, autocompletion: undefined });
            }

            try {
                const records: Record<string, AutocompleteCard> = await autocomplete(value);
                this.setState({ ...this.state, autocompletion: records });
            } catch (e) {
                if (e.message !== 'no data') {
                    throw e;
                }
                this.setState({ ...this.state, autocompletion: undefined });
            }
        }, 200);
    }

    private onInput(e: ChangeEvent) {
        const { value } = e.target as HTMLInputElement;
        this.setState({ ...this.state, ...{ text: value } });

        this.onTextChangedDebounced(value);
    };

    private onKeyPressed(e: React.KeyboardEvent<HTMLInputElement>) {
        const { autocompletion, text } = this.state;

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

    private handleSearchRequest(text: string) {
        this.onTextChangedDebounced.cancel();
        this.setState({ ...this.state, text, autocompletion: undefined });
        this.props.onSearchRequested(text, false);
    };

    private onAutocomplete(text: string) {
        this.onTextChangedDebounced.cancel();
        this.setState({ ...this.state, text, autocompletion: undefined });
        this.props.onSearchRequested(text, true);
    };

    private onClear() {
        this.onTextChangedDebounced.cancel();
        this.setState({ ...this.state, text: '', autocompletion: undefined });
        this.inputRef.current.focus();
    };

    private onCancel(text: string) {
        this.onTextChangedDebounced.cancel();
        this.setState({ ...this.state, text: text, autocompletion: undefined });
        this.inputRef.current.blur();
    };

    render() {
        const { autocompletion, text } = this.state;
        let aucompleteCards: AutocompleteCard[] = [];
        if (autocompletion) {
            const keys = Object.keys(autocompletion);
            for (let key of keys) {
                aucompleteCards.push(autocompletion[key]);
            }
        }

        return (
            <>
                <div className="search-container">
                    <div className="search-panel">
                        <label className="search-panel__label" htmlFor="search-input">
                            <SearchIcon className="search-icon" />
                            <form onSubmit={(e) => e.preventDefault()}>
                                <input value={text}
                                    onChange={(e) => this.onInput(e)}
                                    onKeyDown={(e) => this.onKeyPressed(e)}
                                    id="search-input"
                                    ref={this.inputRef}
                                    required
                                    autoComplete="off" />
                            </form>
                            <div className="search-label">
                                <div className="search-label__placeholder">Search</div>
                            </div>
                        </label>
                        {<div className={cn('search-cross', { 'search-cross--hidden': !Boolean(text) })}
                            onClick={() => this.onClear()}>&times;</div>}
                    </div>
                    <button
                        className="search-button"
                        onClick={() => this.onCancel(text)}
                        aria-label="search">
                        Cancel
                    </button>
                </div>
                {
                    Boolean(text) && aucompleteCards.length > 0 &&
                    <Autocomplete onAutocomplete={this.onAutocomplete.bind(this)} cards={aucompleteCards} />
                }
            </>
        );
    }
}
