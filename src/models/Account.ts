import { ajax } from 'rxjs/ajax';
import { EMPTY, Observable, ReplaySubject, Subject } from 'rxjs';
import { baseUrl } from '../utils/config';
import { All, BaseSvc } from './base';
import retrier from './retrier';
import { catchError } from 'rxjs/operators';
import * as org from './org';

type AccountSvc = { // TODO share with svc????
  id: string;
  oId: string;
  uId: string;
  name: string;
  num: number;
  begAt: Date;
  isCr?: boolean; // required if different than parent
  note?: string;
  paId?: string; // required if not top-level
  catId?: number;
  closes: [{
    id: number;
    fund: number;
    bal: number;
  }];
  suss: [{
    begAt: Date;
    bUId: string;
    endAt?: Date;
    eUId?: string;
    note?: string;
  }]
} & BaseSvc;

export const CategoryIds = Object.freeze({ // WARN: service dep
  ASSET: 1,
  LIABILITY: 2,
  EQUITY: 3,
  INCOME: 4,
  EXPENSE: 5
});

type Category = {
  id: number;
  tag: string;
  isCr: boolean;
};

export const Categories: {[key: number]: Category} = Object.freeze({ // WARN: service dep
  1: {id: 1, tag: 'assets', isCr: false},
  2: {id: 2, tag: 'liabilities', isCr: true},
  3: {id: 3, tag: 'equity', isCr: true},
  4: {id: 4, tag: 'revenue', isCr: true},
  5: {id: 5, tag: 'expenses', isCr: false}
});

type ArrayChg<T> = {
  add?: [number, T];
  rem?: number;
};

type AccountChg = {
  name?: string;
  num?: number;
  isCr?: boolean;
  note?: string;
  chChg?: ArrayChg<Account>;
};

export type Account = {
  id: string;
  uId: string;
  name: string;
  num: number;
  cat: Category;
  isCr: boolean;
  note?: string;
  paAcct?: Account; // null if general acct
  chAccts: Account[];
  tmpCatId?: number; // tmp until inherit parent
  tmpPaId?: string; // tmp until inherit parent
  svcIsCr?: boolean; // service value
  chg$: Subject<AccountChg>; // posts "before" props
} & BaseSvc;

type AccountsStore = {
  [key: string]: Account;
};

const fromSvc = (o: AccountSvc): Account => ({
  id: o.id,
  uId: o.uId,
  name: o.name,
  num: o.num,
  cat: Categories[CategoryIds.ASSET], // default, fix in inherit parent
  isCr: false, // default, fix in inherit parent
  note: o.note,
  chAccts: [],
  tmpCatId: o.catId,
  tmpPaId: o.paId,
  svcIsCr: o.isCr,
  at: o.at,
  upAt: o.upAt,
  v: o.v,
  chg$: new Subject<AccountChg>()
});

export const accountsStore: AccountsStore = {}
export const generalAccounts: {[key: number]: Account} = {};

const addToParent = (acct: Account) => {
  // scan O(n**2) OK as there will not be many children
  const arr = acct.paAcct?.chAccts ?? [];
  for(let i = 0; i < arr.length; ++i) {
    const a = arr[i];
    if (a.num === acct.num) throw new Error(`account ${acct.id}: duplicate number: ${acct.num}`);
    if (acct.num < a.num) {
      arr.splice(i, 0, acct);
      return;
    }
  }
  arr.push(acct);
};

const inheritParent = (acct: Account) => {
  if (acct.tmpCatId) { // init general account
    if (acct.tmpPaId) throw new Error(`account ${acct.id}: category on non-general account`);
    const category = Categories[acct.tmpCatId];
    if (!category) throw new Error(`account ${acct.id}: invalid category: ${acct.tmpCatId}`);
    delete acct.tmpCatId;
    acct.cat = category;
    acct.isCr = category.isCr;
    if (generalAccounts[category.id]) throw new Error(`account ${acct.id}: general account already exists: ${category.tag}`);
    generalAccounts[category.id] = acct;
  } else if (acct.tmpPaId) { // init non-general account
    const parent = accountsStore[acct.tmpPaId];
    if (!parent) throw new Error(`account ${acct.id}: invalid parent id: ${acct.tmpPaId}`);
    delete acct.tmpPaId;
    inheritParent(parent); // recurse to ancestors
    acct.paAcct = parent;
    acct.cat = parent.cat;
    if ('svcIsCr' in acct) {
      acct.isCr = acct.svcIsCr || false; // false needed for ts
    } else {
      acct.isCr = parent.isCr;
    }
    addToParent(acct);
  }
};

const initStore = (accts: AccountSvc[]) => {
  accts.forEach(acct => {accountsStore[acct.id] = fromSvc(acct);});
  for (const id in accountsStore) {
    inheritParent(accountsStore[id]);
  }
};

let accountsLoad$: Subject<void>; // TODO remove
let all$: Subject<All<Account>>;
let generals$ = new ReplaySubject<Array<Account>>(1);

export const getAll$ = () => {
  if (all$) return all$;
  all$ = new ReplaySubject<All<Account>>(1);
  // org.

}

export const accountsLoad = (): Subject<void> => {
  if (accountsLoad$) return accountsLoad$;
  ajax.getJSON<AccountSvc[]>(`${baseUrl}/accounts`)
    .pipe(retrier())
    .subscribe({
      next: accts => {
        initStore(accts);
        accountsLoad$ = new ReplaySubject<void>(1);
        accountsLoad$.next();
      }});
  return accountsLoad$;
};

export const post = (acct: Account) => {


}

export const patch = (acct: Account, patch: AccountChg) => {
  const before: AccountChg = {};
  let svcProp = false;

  // TODO other props

  if (!svcProp) { // no svc patch needed
    acct.chg$.next(before);
  } else {
    // TODO ajax
  }
};

export const suspend = (acct: Account) => {
  const parent = acct.paAcct;

  // TODO 

  if (parent) {
    // TODO const before = {children: [...parent.children]};
    // TODO parent.chg$.next(before);
  }
  acct.chg$.complete(); // notify deleted
};
