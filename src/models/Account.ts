import { ajax } from 'rxjs/ajax';
import { EMPTY, ReplaySubject, Subject } from 'rxjs';
import { baseUrl } from '../utils/config';
import * as mdl from './mdl';
import * as descs from './descs';
import * as actts from './actts';
import retrier from './retrier';
import * as org from './org';
import { catchError } from 'rxjs/operators';
import { CATEGORIES, Category, CATEGORY_IDS, Get, CloseGet } from '../api/accounts';
import { toDate } from '../common/acctdate';
import GlbState from './glbstate';
import { Alert } from './alert';

export type CloseMdl = CloseGet;
const fromCloseGet = (g: CloseGet): CloseMdl => g;

export type Chg = {
  num?: number;
  name?: string;
};
export type Mdl = mdl.Rsc<Chg> & {
  oId: string;
  num: number;
  name: string;
  begAt: Date;
  desc: descs.Mdl;
  sum?: Mdl; // missing if general acct
  cat: Category;
  isCr: boolean;
  clos: mdl.Arr<CloseMdl>;
  actts: mdl.Arr<actts.Mdl>;
  subs: mdl.Arr<Mdl>;
  svcIsCr?: boolean; // service value
  tmpCatId?: number; // tmp until inherit parent
  tmpSumId?: string; // tmp until inherit parent
};
const fromGet = (g: Get): Mdl => ({
  ...mdl.fromGet(g),
  oId: g.oId,
  num: g.num,
  name: g.name,
  begAt: toDate(g.begAt),
  desc: descs.fromGet(g.desc),
  cat: CATEGORIES[CATEGORY_IDS.ASSET], // default, fix in inherit parent
  isCr: false, // default, fix in inherit parent
  clos: mdl.makeArr(g.clos, fromCloseGet),
  actts: mdl.makeArr(g.actts, actts.fromGet),
  subs: mdl.makeArr([], fromGet),
  svcIsCr: g.isCr,
  tmpCatId: g.catId,
  tmpSumId: g.sumId,
});
const cmpl = (m: Mdl) => {
  mdl.arrCmpl(m.subs, cmpl);
  mdl.arrCmpl(m.clos);
  mdl.arrCmpl(m.actts);
  mdl.cmpl(m);
};

const addToArray = (arr: mdl.Arr<Mdl>, acct: Mdl, init?: boolean) => {
  // scan O(n**2) OK as there will not be many children
  for(let i = 0; i < arr.length; ++i) {
    const a = arr[i];
    if (a.num === acct.num) throw new Error(`account ${acct.id}: duplicate number: ${acct.num}`);
    if (acct.num < a.num) {
      if (init) arr.splice(i, 0, acct);
      else mdl.addToMdl(arr, acct, i);
      return;
    }
  }
  if (init) arr.push(acct);
  else mdl.addToMdl(arr, acct, -1);
};

const inheritSum = (all: {[k: string]: Mdl}, gens: {[k: string]: Mdl}, acct: Mdl) => {
  if (acct.tmpCatId) { // init general account
    if (acct.tmpSumId) throw new Error(`account ${acct.id}: category on non-general account`);
    const category = CATEGORIES[acct.tmpCatId];
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
    addToArray(sum.subs, acct, true);
  }
};

// chart of accounts, these are the general accounts with recursive sub accounts
// all levels are sorted by num
export type Chart = mdl.Arr<Mdl>;
const chartFromGets = (gs: Get[]): Chart => {
  const all: {[k: string]: Mdl} = {};
  const gens: {[k: string]: Mdl} = {};
  gs.forEach(acct => {all[acct.id] = fromGet(acct);});
  for (const acct of Object.values(all)) {
    inheritSum(all, gens, acct);
  }
  const chart: Chart = mdl.makeArr([], fromGet);
  chart.splice(0, 0, ...Object.values(gens));
  return chart.sort((o0: Mdl, o1: Mdl) => o0.num - o1.num);
};
const chartCmpl = (c: Chart) => mdl.arrCmpl(c, cmpl);

let state = new GlbState<Chart>('account');

// returns stream containing current chart, or that will contain
// chart after call to org.set(id)/load(), and successful get of accounts
// does not report errors, completes on org clear
export const get$ = (): ReplaySubject<Chart> => state.mdl$;

// load chart of accounts for current or future org (call org.set())
// returns an ack stream that will report error or success (complete)
// can call again on error
// show alert (set retry action) before reporting error
export const load = (overrideAlert?: Alert): Subject<void> => {
  if (!state.ack$) {
    state.ack$ = new Subject();
    org.get$().subscribe({
      next: org => {
        const opts = overrideAlert ? {overrideAlert} : {};
        state.subscpt = ajax.getJSON<Get[]>(`${baseUrl}/accounts`, {'X-OId': org.id})
          .pipe(retrier(opts))
          .subscribe({
            next: gs => state.next(chartFromGets(gs)),
            error: e => state.error(e)
          })
      },
      complete: () => { // org cleared, user sign out, etc.
        const tmp = state;
        state = new GlbState(tmp);
        tmp.cmpl(chartCmpl);
      }
    });
  }
  return state.ack$;
}


export const post = (acct: Mdl) => {


}

export const patch = (acct: Mdl, patch: Chg) => {
  const before: Chg = {};
  let svcProp = false;

  // TODO other props

  if (!svcProp) { // no svc patch needed
    acct.chg$.next(before);
  } else {
    // TODO ajax
  }
};

export const suspend = (acct: Mdl) => {
  // TODO const sum = acct.sum;
};

export const reactivate = (acct: Mdl) => {
  // TODO const sum = acct.sum;
};
