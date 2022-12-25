import { Component, useCallback, useState, useEffect } from 'react';

import { ParsedRowDetails } from '../../../../common/Row';
import { getCard } from '../../api';
import { LoadingLabel } from '../../components/LoadingLabel';
import { CardDetails } from '../../components/CardDetails';
import ArrowIcon from '../../icons/arrow_back.svg';
import { useMatch, useMatches, useNavigate } from 'react-router';

import './CardLayout.scss';

export interface State {
    card?: ParsedRowDetails;
    isFetching: boolean;
}

export const CardLayout = () => {
    const navigate = useNavigate();
    const [isFetching, setIsFetching] = useState(true);
    const [card, setCard] = useState<ParsedRowDetails | undefined>();

    const { params } = useMatch('/card/:id/');
    const { id } = params;

    useEffect(() => {
        setIsFetching(true);
        setCard(undefined);

        const requestCard = async (value) => {
            const { card } = await getCard(value);
            if (!card) return;
            setIsFetching(false);
            setCard(card);
        }

        requestCard(id);
    }, []);

    const onBackClick = useCallback(() => navigate(-1), []);

    return (
        <div className="card-layout">
            <div className="card-layout__header">
                <div className="card-layout__back-button" onClick={onBackClick}>
                    <ArrowIcon width={24} height={24} fill="#fff" />
                </div>
                <div className="card-layout__name">{card?.name}</div>
            </div>
            {isFetching ? <LoadingLabel /> : <CardDetails card={card} />}
        </div>
    );

}
