import * as React from 'react';
import { SearchInput } from '../../components/SearchInput';
import { CardsLayout } from '../../components/CardsLayout';
import { LoadingLabel } from '../../components/LoadingLabel';
import { ParsedRow } from '../../entities/Row';
import { AutocompleteCard } from '../../entities/AutocompleteCard';
import { ShowMore } from '../../components/ShowMore';

export interface Props {
    isFetching: boolean;
    rows?: ParsedRow[];
    searchText?: string;
    autocompletion?: Record<string, AutocompleteCard>;
    onSearch: (value: string, isAutocompletion?: boolean) => void;
    onTextChanged: (value: string) => void;
    onMore: () => void;
    pageCount: number;
    page: number;
}

export class SearchList extends React.Component<Props> {
    render () {
        const { isFetching, rows, searchText, autocompletion, onSearch, onTextChanged, onMore, pageCount, page } = this.props;
        return (<>
            <SearchInput onSearchRequested={ onSearch }
                         onTextChanged={ onTextChanged }
                         autocompletion={ autocompletion }
                         text={ searchText }/>
            <div className="content-container">
                { (!isFetching || rows) && <CardsLayout rows={ rows }/> }
                { isFetching && <LoadingLabel/> }
            </div>
            { page < pageCount - 1 && !isFetching && <ShowMore onMoreRequested={ onMore }/> }
        </>);
    }
}
