import * as base from './base';
import * as desc from './desc';
import * as actt from './actt';

export const CATEGORY_IDS = Object.freeze({
  ASSET: 1,
  LIABILITY: 2,
  EQUITY: 3,
  INCOME: 4,
  EXPENSE: 5
});

export type Category = {
  id: number;
  tag: string;
  isCr: boolean;
};

export const CATEGORIES: {[key: number]: Category} = Object.freeze({
  1: {id: 1, tag: 'assets', isCr: false},
  2: {id: 2, tag: 'liabilities', isCr: true},
  3: {id: 3, tag: 'equity', isCr: true},
  4: {id: 4, tag: 'revenue', isCr: true},
  5: {id: 5, tag: 'expenses', isCr: false}
});

export type CloseGet = {
  id: number;
  fnId: number;
  bal: number;
};

export type Get = base.Get & {
  oId: string;
  num: number;
  name: string;
  begAt: number;
  desc: desc.Get;
  sumId?: string;
  catId?: number;
  isCr?: boolean;
  clos: CloseGet[];
  actts: actt.Get[];
};
