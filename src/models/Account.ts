import { ajax } from 'rxjs/ajax';
import { ReplaySubject, Subject } from 'rxjs';
// import { finalize, mergeMap, retryWhen } from 'rxjs/operators';
// import { throwError, timer } from 'rxjs';

type AccountSvc = {
  id: string,
  createdAt: Date
  userId: string,
  name: string,
  num: number,
  isCredit?: boolean, // required if different than parent
  desc?: string,
  parentId?: string, // required if not top-level
  categoryId?: number,
  balance?: number, // required if leaf
};

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

type AccountChange = {
  name?: string,
  num?: number,
  isCredit?: boolean,
  desc?: string,
  balance?: number
  balanceRange?: number,
  children?: Account[]
};

export type Account = {
  id: string,
  createdAt: Date,
  userId: string,
  name: string,
  num: number,
  category: Category,
  isCredit: boolean,
  desc?: string,
  parent?: Account, // null if general acct
  balance?: number // required iif leaf, this is the "close" balance
  balanceRange: number,
  children: Account[]
  tmpCategoryId?: number, // tmp until inherit parent
  tmpParentId?: string, // tmp until inherit parent
  svcIsCredit?: boolean, // service value
  changes$: Subject<AccountChange> // posts "before" props
};

type AccountsStore = {
  [key: string]: Account
};

const fromSvc = (o: AccountSvc): Account => ({
  id: o.id,
  createdAt: o.createdAt,
  userId: o.userId,
  name: o.name,
  num: o.num,
  category: Categories[CategoryIds.ASSET], // default, fix in inherit parent
  isCredit: false, // default, fix in inherit parent
  desc: o.desc,
  balance: o.balance,
  balanceRange: 0,
  children: [],
  tmpCategoryId: o.categoryId,
  tmpParentId: o.parentId,
  svcIsCredit: o.isCredit,
  changes$: new Subject<AccountChange>()
});

// TODO when serving from service: new URL(document.URL)....
//const baseUrl = `${new URL(document.URL).origin}/api/v1`;
const baseUrl = 'http://localhost:5000/api/v1';

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
  if (acct.tmpCategoryId) { // init general account
    if (acct.tmpParentId) throw new Error(`account ${acct.id}: category on non-general account`);
    const category = Categories[acct.tmpCategoryId];
    if (!category) throw new Error(`account ${acct.id}: invalid category: ${acct.tmpCategoryId}`);
    delete acct.tmpCategoryId;
    acct.category = category;
    acct.isCredit = category.isCredit;
    if (generalAccounts[category.id]) throw new Error(`account ${acct.id}: general account already exists: ${category.name}`);
    generalAccounts[category.id] = acct;
  } else if (acct.tmpParentId) { // init non-general account
    const parent = accountsStore[acct.tmpParentId];
    if (!parent) throw new Error(`account ${acct.id}: invalid parent id: ${acct.tmpParentId}`);
    delete acct.tmpParentId;
    inheritParent(parent); // recurse to ancestors
    acct.parent = parent;
    acct.category = parent.category;
    if ('svcIsCredit' in acct) {
      acct.isCredit = acct.svcIsCredit || false; // false needed for ts
    } else {
      acct.isCredit = parent.isCredit;
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

export const accountPatch = (acct: Account, patch: AccountChange) => {
  const before: AccountChange = {};
  if ('balanceRange' in patch && acct.balanceRange !== patch.balanceRange) {
    before.balanceRange = acct.balanceRange;
    acct.balanceRange = patch.balanceRange!; // TODO should this be done now?
    // TODO is there a use case for both this and svc prop simultaneous change????
  }
  let svcProp = false;

  // TODO other props

  if (!svcProp) { // no svc patch needed
    acct.changes$.next(before);
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
    parent.changes$.next(before);
  }
  acct.changes$.complete(); // notify deleted
};
