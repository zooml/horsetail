import { ajax } from 'rxjs/ajax';
import { EMPTY, ReplaySubject, Subject } from 'rxjs';
import { baseUrl } from '../utils/config';
import { ArrChg, Rsc, Get, MdlWChg } from './base';
import retrier from './retrier';
import * as org from './org';
import { catchError } from 'rxjs/operators';

type AccountSvc = { // TODO share with svc????
  id: string;
  oId: string;
  uId: string;
  name: string;
  num: number;
  begAt: Date;
  isCr?: boolean; // required if different than parent
  note?: string;
  sumId?: string; // required if not top-level
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
} & Get;

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

export type AccountChg = {
  name?: string;
  num?: number;
  isCr?: boolean;
  note?: string;
  subs?: ArrChg<Account>;
  // TODO closes, suss
};

export type Account = Rsc<AccountChg> & {
  id: string;
  uId: string;
  name: string;
  num: number;
  cat: Category;
  isCr: boolean;
  note?: string;
  sum?: Account; // null if general acct
  subs: Account[];
  // TODO closes, suss
  tmpCatId?: number; // tmp until inherit parent
  tmpSumId?: string; // tmp until inherit parent
  svcIsCr?: boolean; // service value
};

export type Chart = Account[];

export type Chg$WChart = MdlWChg<ArrChg<Account>, Chart>;

const fromSvc = (o: AccountSvc): Account => ({
  id: o.id,
  uId: o.uId,
  name: o.name,
  num: o.num,
  cat: Categories[CategoryIds.ASSET], // default, fix in inherit parent
  isCr: false, // default, fix in inherit parent
  note: o.note,
  subs: [],
  tmpCatId: o.catId,
  tmpSumId: o.sumId,
  svcIsCr: o.isCr,
  at: o.at,
  upAt: o.upAt,
  v: o.v,
  chg$: new Subject<AccountChg>()
});

const addToArray = (arr: Account[], acct: Account) => {
  // scan O(n**2) OK as there will not be many children
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

const inheritSum = (all: {[k: string]: Account}, gens: {[k: string]: Account}, acct: Account) => {
  if (acct.tmpCatId) { // init general account
    if (acct.tmpSumId) throw new Error(`account ${acct.id}: category on non-general account`);
    const category = Categories[acct.tmpCatId];
    if (!category) throw new Error(`account ${acct.id}: invalid category: ${acct.tmpCatId}`);
    delete acct.tmpCatId;
    acct.cat = category;
    acct.isCr = category.isCr;
    if (gens[category.id]) throw new Error(`account ${acct.id}: general account already exists: ${category.tag}`);
    gens[category.id] = acct;
  } else if (acct.tmpSumId) { // init non-general account
    const sum = all[acct.tmpSumId];
    if (!sum) throw new Error(`account ${acct.id}: invalid parent id: ${acct.tmpSumId}`);
    delete acct.tmpSumId;
    inheritSum(all, gens, sum); // recurse to ancestors
    acct.sum = sum;
    acct.cat = sum.cat;
    if ('svcIsCr' in acct) {
      acct.isCr = acct.svcIsCr || false; // false needed for ts
    } else {
      acct.isCr = sum.isCr;
    }
    addToArray(sum.subs, acct);
  }
};

const init = (accts: AccountSvc[]): Chart => {
  const all: {[k: string]: Account} = {};
  const gens: {[k: string]: Account} = {};
  accts.forEach(acct => {all[acct.id] = fromSvc(acct);});
  for (const id in all) {
    inheritSum(all, gens, all[id]);
  }
  const chart = Object.values(gens);
  return chart.sort((o0: Account, o1: Account) => o0.num - o1.num);
};

let loadState = 0;
let oId = '';
let chg$WChart: Chg$WChart | undefined;
let chg$WChart$: Subject<Chg$WChart> = new ReplaySubject<Chg$WChart>(1);

const load = () => {
  ajax.getJSON<AccountSvc[]>(`${baseUrl}/accounts`, {'X-OId': oId})
    .pipe(retrier(), catchError(() => {loadState = 0; return EMPTY;}))
    .subscribe({
      next: accts => {
        loadState = 2;
        chg$WChart = {
          chg$: new Subject(),
          mdl: init(accts)
        };
        chg$WChart$.next(chg$WChart);
      }});
};

const complete = () => {
  // WARN the individual accounts are not completed
  loadState = 0;
  oId = '';
  chg$WChart = undefined;
  const tmp = chg$WChart$;
  chg$WChart$ = new ReplaySubject();
  tmp.complete();
};

export const getChg$WChart$ = () => {
  if (!loadState) {
    loadState = 1;
    org.get$().subscribe({
      next: org => {
        oId = org.id;
        load();
      },
      complete: complete
    });
  }    
  return chg$WChart$;
}

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
  const sum = acct.sum;

  // TODO 

  if (sum) {
    // TODO const before = {children: [...parent.children]};
    // TODO parent.chg$.next(before);
  }
  acct.chg$.complete(); // notify deleted
};
