import { useCallback, useEffect, useState } from 'react';
import * as cn from 'classnames';
import * as querystring from 'query-string';

import { SearchInput } from '../../components/SearchInput';
import { CardsTable } from '../../components/CardsTable';
import { LoadingLabel } from '../../components/LoadingLabel';
import { ParsedRow } from '../../../../common/Row';
import { ShowMore } from '../../components/ShowMore';
import { Paging } from '../../../../common/Paging';
import { searchByName } from '../../api';
import MenuIcon from '../../icons/menu.svg';
import CameraIcon from '../../icons/camera.svg';

import './SearchList.scss';
import { Menu } from '../../components/Menu';
import { useNavigate } from 'react-router';

interface State extends Paging {
    rows?: ParsedRow[];
    card?: ParsedRow;
    isFetching: boolean;
    searchText?: string;
    isAutocompletion: boolean;
    shouldUpdate: boolean;
    isMenuOpen: boolean;
}

interface Config {
    searchText?: string;
    page: number;
    pageCount: number;
    rows?: ParsedRow[];
    card?: ParsedRow;
}

const config: Config = JSON.parse(localStorage.getItem('config'));
const { name: queryName, auto } = querystring.parse(document.location.search);

export const SearchList = () => {
    const navigate = useNavigate();

    const [state, setState] = useState<State>({
        ...config,
        isFetching: false,
        isAutocompletion: false,
        searchText: queryName as string || (config && config.searchText) || '',
        shouldUpdate: Boolean(queryName) && queryName !== config.searchText,
        isMenuOpen: false
    })

    const requestData = async (value: string, isAutocompletion: boolean, newPage: number = 0) => {
        const { rows: stateRows = [] } = state;
        const newStateRows = newPage > 0 ? stateRows : [];
        setState({
            ...state,
            isFetching: true,
            rows: newStateRows.length > 0 ? newStateRows : undefined,
            isAutocompletion,
            searchText: value
        });
        const res = await searchByName(value, isAutocompletion, newPage);
        if (!res) {
            return;
        }
        const { rows, page, pageCount } = res;
        const config: Config = {
            rows: [...newStateRows, ...rows],
            page,
            pageCount,
            searchText: value
        };
        localStorage.setItem('config', JSON.stringify(config));
        setState({
            ...state,
            ...config,
            isFetching: false,
            shouldUpdate: false
        });
    };

    useEffect(() => {
        const { shouldUpdate, searchText, isAutocompletion } = state;
        if (shouldUpdate) {
            requestData(searchText, isAutocompletion);
        }
    }, [])

    useEffect(() => {
        const { name: queryName, auto } = querystring.parse(document.location.search);
        const { searchText } = state;

        if (queryName !== searchText) {
            setState({ ...state, searchText: queryName as string });
        }
    }, [])


    const openMenu = useCallback(() => {
        setState({ ...state, isMenuOpen: true });
    }, []);

    const onSearch = async (value: string, isAutocompletion?: boolean) => {
        if (!value) {
            return;
        }

        const query: { name: string, auto?: boolean } = { name: value };
        if (isAutocompletion) {
            query.auto = true;
        }

        await requestData(value, isAutocompletion);
        navigate(`?${querystring.stringify(query)}`);
    };


    const onMore = useCallback(() => {
        const { searchText, page, isAutocompletion } = state;
        requestData(searchText, isAutocompletion, page + 1);
    }, []);

    const closeMenu = useCallback(() => {
        setState({ ...state, isMenuOpen: false });
    }, []);

    const { isFetching, rows, searchText, pageCount, page, isMenuOpen } = state;
    return (<div className="search-layout">
        <div className="search-layout__container">
            <header className="header">
                <MenuIcon className="header__menu-button" onClick={openMenu} fill="#fff" />
                <div className="header__name">TukTuk</div>
                <CameraIcon className="header__camera-button" fill="#fff" />
            </header>
            <SearchInput onSearchRequested={onSearch}
                initialText={searchText} />
            <article className="content-container">
                {(!isFetching || rows) && <CardsTable rows={rows} />}
                {isFetching && <LoadingLabel />}
            </article>
            {page < pageCount && !isFetching && <ShowMore onMoreRequested={onMore} />}
        </div>
        <div className={cn('search-layout__backdrop', { 'search-layout--backdrop-visible': isMenuOpen })} />
        <div className={cn('search-layout__menu', { 'search-layout--menu-open': isMenuOpen })}>
            <Menu onClose={closeMenu} />
        </div>
    </div>);

}
