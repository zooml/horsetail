import { ajax } from 'rxjs/ajax';
import { ReplaySubject, Subject } from 'rxjs';
import { baseUrl } from '../utils/config';
import { BaseSvc } from './base';
// import { finalize, mergeMap, retryWhen } from 'rxjs/operators';
// import { throwError, timer } from 'rxjs';

type AccountSvc = {
  id: string,
  oId: string,
  uId: string,
  name: string,
  num: number,
  begAt: Date,
  isCr?: boolean, // required if different than parent
  note?: string,
  paId?: string, // required if not top-level
  catId?: number,
  closes: [
    {
      id: number,
      fund: number,
      bal: number
    }
  ],
  suss: [
    {
      begAt: Date,
      bUId: string,
      endAt?: Date,
      eUId?: string,
      note?: string
    }
  ]
} & BaseSvc;

export const CategoryIds = Object.freeze({ // WARN: service dep
  ASSET: 1,
  LIABILITY: 2,
  EQUITY: 3,
  INCOME: 4,
  EXPENSE: 5
});

type Category = {
  id: number,
  name: string,
  isCredit: boolean
};

export const Categories: {[key: number]: Category} = Object.freeze({ // WARN: service dep
  1: {id: 1, name:'assets', isCredit: false},
  2: {id: 2, name:'liabilities', isCredit: true},
  3: {id: 3, name:'equity', isCredit: true},
  4: {id: 4, name:'revenue', isCredit: true},
  5: {id: 5, name:'expenses', isCredit: false}
});

type AccountChg = {
  name?: string,
  num?: number,
  isCr?: boolean,
  note?: string,
  children?: Account[]
};

export type Account = {
  id: string,
  uId: string,
  name: string,
  num: number,
  cat: Category,
  isCr: boolean,
  note?: string,
  parent?: Account, // null if general acct
  children: Account[]
  tmpCatId?: number, // tmp until inherit parent
  tmpPaId?: string, // tmp until inherit parent
  svcIsCr?: boolean, // service value
  chg$: Subject<AccountChg> // posts "before" props
} & BaseSvc;

type AccountsStore = {
  [key: string]: Account
};

const fromSvc = (o: AccountSvc): Account => ({
  id: o.id,
  uId: o.uId,
  name: o.name,
  num: o.num,
  cat: Categories[CategoryIds.ASSET], // default, fix in inherit parent
  isCr: false, // default, fix in inherit parent
  note: o.note,
  children: [],
  tmpCatId: o.catId,
  tmpPaId: o.paId,
  svcIsCr: o.isCr,
  at: o.at,
  upAt: o.upAt,
  v: o.v,
  chg$: new Subject<AccountChg>()
});

// https://gist.github.com/tanem/011a950b93a89e43cfc335f617dbb230
// const genericRetryStrategy = ({
//   maxRetryAttempts = 3,
//   scalingDuration = 5000
// } = {}) => errors =>
//   errors.pipe(
//     mergeMap((error, index) => {
//       const retryAttempt = index + 1;
//       if (retryAttempt > maxRetryAttempts) {
//         return throwError(err => new Error('adfadfa'+ err.message));
//       }
//       console.log(
//         `Attempt ${retryAttempt}: Retrying in ${retryAttempt *
//           scalingDuration}ms`
//       );
//       return timer(retryAttempt * scalingDuration);
//     }),
//     finalize(() => console.log('We are done!'))
//   );

let accountsLoad$: Subject<void>;
export const accountsStore: AccountsStore = {}
export const generalAccounts: {[key: number]: Account} = {};

const addToParent = (acct: Account) => {
  // scan O(n2) OK as there will not be many children
  const arr = acct.parent?.children ?? [];
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

const removeFromParent = (acct: Account) => {
  const children = acct.parent?.children;
  if (!children) return;
  const i = children.indexOf(acct);
  if (i < 0) {
    console.error(`account ${acct.id}: not in parent children array`);
    return;
  }
  children.splice(i, 1);
  return;
};

const inheritParent = (acct: Account) => {
  if (acct.tmpCatId) { // init general account
    if (acct.tmpPaId) throw new Error(`account ${acct.id}: category on non-general account`);
    const category = Categories[acct.tmpCatId];
    if (!category) throw new Error(`account ${acct.id}: invalid category: ${acct.tmpCatId}`);
    delete acct.tmpCatId;
    acct.cat = category;
    acct.isCr = category.isCredit;
    if (generalAccounts[category.id]) throw new Error(`account ${acct.id}: general account already exists: ${category.name}`);
    generalAccounts[category.id] = acct;
  } else if (acct.tmpPaId) { // init non-general account
    const parent = accountsStore[acct.tmpPaId];
    if (!parent) throw new Error(`account ${acct.id}: invalid parent id: ${acct.tmpPaId}`);
    delete acct.tmpPaId;
    inheritParent(parent); // recurse to ancestors
    acct.parent = parent;
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

export const accountsLoad = (): Subject<void> => {
  if (accountsLoad$) return accountsLoad$;
  accountsLoad$ = new ReplaySubject<void>(1);
  // TODO retries
  console.log(`${baseUrl}/accounts`);
  ajax.getJSON<AccountSvc[]>(`${baseUrl}/accounts`)
    .subscribe({
      next: rsp => {
        console.log('response: ', rsp); // TODO remove
        initStore(rsp);
        accountsLoad$.next();
      },
      error: err => {
        console.log('error: ', err); // TODO remove

        // TODO retry, error handling

        accountsLoad$.error(err);
      }});
  return accountsLoad$;
};

export const accountPatch = (acct: Account, patch: AccountChg) => {
  const before: AccountChg = {};
  let svcProp = false;

  // TODO other props

  if (!svcProp) { // no svc patch needed
    acct.chg$.next(before);
  } else {
    // TODO ajax
  }
};

export const accountDelete = (acct: Account) => {
  const parent = acct.parent;

  // TODO replace with terminate

  if (parent) {
    const before = {children: [...parent.children]};
    removeFromParent(acct);
    parent.chg$.next(before);
  }
  acct.chg$.complete(); // notify deleted
};
