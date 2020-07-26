import { ParsedRow } from '@tuktuk-scg-scrapper/common/Row';

type HawkSearchAnswer = {
    Results: {
        Custom: {
            unique_id: string;
            item_display_name: string;
            primary_category_name: string;
            subtitle: string;
            child_information: string[];
            url_detail: string;
        };
    }[];
    Pagination: {
        CurrentPage: number;
        NofPages: number;
    };
};

type ChildInformationObject = {
    condition: string | null;
    flag_img: string | null;
    image_url: string | null;
    isCard: boolean;
    sku: string;
    price: string;
    language: string | null;
    qty: string;
};

export const parseScgListAnswer = async (input: HawkSearchAnswer) => {
    const parsedRows: Partial<ParsedRow>[] = [];

    input.Results.forEach((res) => {
        const card: ParsedRow = {
            id: parseInt(res.Custom.unique_id, 10),
            name: res.Custom.item_display_name,
            subtitle: res.Custom.subtitle,
            set: res.Custom.primary_category_name,
            url: res.Custom.url_detail,
            cards: [],
        };

        res.Custom.child_information.forEach((child) => {
            const childObject: ChildInformationObject = JSON.parse(child);
            card.cards.push({
                condition: parseCondition(childObject.condition),
                price: parseFloat(childObject.price),
                stock: parseInt(childObject.qty, 10) || 0,
                purchasing_disabled: false,
                language: childObject.language || 'English',
            })
        });

        card.cards.sort(
          (a, b) =>
            (conditionMap[b.condition] || 0) -
            (conditionMap[a.condition] || 0)
        );

        parsedRows.push(card);
    });

    return {
        rows: parsedRows.filter((c) => c.cards.length),
        page: input.Pagination.CurrentPage,
        pageCount: input.Pagination.NofPages,
    };
};

const parseCondition = (cond: string) => {
    switch (cond) {
        case 'Played':
            return 'PL';
        case 'Heavily Played':
            return 'HP';
        case 'Near Mint':
            return 'NM';
        case 'Damaged':
            return 'DM';
        default:
            return cond;
    }
};

const conditionMap = {
    NM: 4,
    PL: 3,
    HP: 2,
    DM: 1,
};
