import * as React from 'react';
import * as cn from 'classnames';
import { AutocompleteCard } from '../../entities/AutocompleteCard';

import './Autocomplete.scss';

export interface Props {
    cards: AutocompleteCard[];
    onAutocomplete: (name: string) => void;
}

interface State {
    selected?: number;
}

export class Autocomplete extends React.Component<Props, State> {
    constructor (props) {
        super(props);

        this.state = {};
    }

    private onKeyDown (e: KeyboardEvent) {
        const { selected } = this.state;
        const { cards, onAutocomplete } = this.props;

        switch (e.key) {
            case 'ArrowUp':
                selected > 0 && this.setState({ ...this.state, selected: selected - 1 });
                break;
            case 'ArrowDown':
                if (Number.isInteger(selected)) {
                    selected < cards.length - 1 && this.setState({ ...this.state, selected: selected + 1 });
                } else {
                    this.setState({ ...this.state, selected: 0 });
                }
                break;
            case 'Enter':
                if (Number.isInteger(selected)) {
                    onAutocomplete(cards[selected].name);
                }
                break;
        }
    }

    private onKeyDownBound = this.onKeyDown.bind(this);

    componentDidMount () {
        document.addEventListener<'keydown'>('keydown', this.onKeyDownBound);
    }

    componentWillUnmount () {
        document.removeEventListener<'keydown'>('keydown', this.onKeyDownBound);
    }

    render () {
        const { cards, onAutocomplete } = this.props;
        const { selected } = this.state;

        return (<div className="autocompletion">
            {
                cards.map((card, i) =>
                    <div
                        className={ cn('autocompletion__card', { 'autocompletion--active': i === selected }) }
                        key={ i }
                        onClick={ () => onAutocomplete(card.name) }>
                        <div className="autocompletion__card-name">{ card.name }{ card.localizedName && <span className="autocompletion__card-secondary-name">{` / ${card.localizedName}`}</span> }</div>
                        <div className="autocompletion__card-text">{ card.text }</div>
                    </div>)
            }
        </div>);
    }
}
