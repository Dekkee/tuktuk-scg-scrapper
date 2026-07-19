import { ParsedRow, ParsedRowDetails } from './Row';
import { Paging } from './Paging';

export type ListResponse = { rows: ParsedRow[] } & Paging;
export type GetResponse = { card: ParsedRowDetails };
