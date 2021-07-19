import { ajax } from 'rxjs/ajax';
import { ReplaySubject, Subject } from 'rxjs';
import { baseUrl } from '../utils/config';
import * as mdl from './mdl';
import * as descs from './descs';
import * as actts from './actts';
import retrier from './retrier';
import * as org from './org';
import { CATEGORIES, Category, CAT_IDS, Get, CloseGet, Post } from '../api/accounts';
import { fromDate, toDate, today } from '../utils/clndate';
import GlbState, { checkPostState } from './glbstate';

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
export type MdlPost = {
  num: number;
  name: string;
  begAt?: Date;
  desc?: descs.Mdl;
  sum?: Mdl; // missing if general acct
  cat?: Category;
  isCr?: boolean;
};
const fromGet = (g: Get): Mdl => ({
  ...mdl.fromGet(g),
  oId: g.oId,
  num: g.num,
  name: g.name,
  begAt: toDate(g.begAt),
  desc: descs.fromGet(g.desc),
  cat: CATEGORIES[CAT_IDS.ASSET], // default, fix in inherit parent
  isCr: false, // default, fix in inherit parent
  clos: mdl.makeArr(g.clos, fromCloseGet),
  actts: mdl.makeArr(g.actts, actts.fromGet),
  subs: mdl.makeArr([], fromGet),
  svcIsCr: g.isCr,
  tmpCatId: g.catId,
  tmpSumId: g.sumId,
});
const toPost = (mp: MdlPost): Post => {
  const p: Post = {
    num: mp.num,
    name: mp.name,
    begAt: fromDate(mp.begAt ? mp.begAt : today()),
  };
  if (mp.desc) p.desc = descs.toPost(mp.desc);
  if (mp.sum) {
    if (mp.cat) throw new Error('accounts: post cannot have sum and cat');
    p.sumId = mp.sum.id;
  }
  if (mp.cat) p.catId = mp.cat.id;
  if (mp.isCr !== undefined) {
    if (mp.cat) {
      if (mp.cat.isCr !== mp.isCr) throw new Error('accounts: post has invalid isCr');
      mp.isCr = undefined;
    }
    if (mp.sum && mp.sum.isCr === mp.isCr) mp.isCr = undefined;
    if (mp.isCr !== undefined) p.isCr = mp.isCr;
  }
  return p;
};
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

let state = new GlbState<Chart>('chart');
let postAck$: Subject<void> | undefined;

// returns stream containing current chart, or that will contain
// chart after call to org.set(id)/load(), and successful get of accounts
// does not report errors, completes on org clear
export const get$ = (): ReplaySubject<Chart> => {
  if (!state.mdl) {
    state.ack$ = new Subject();
    org.get$().subscribe({
      next: org => {
        state.subscpt = ajax.getJSON<Get[]>(`${baseUrl}/accounts`, {'X-OId': org.id})
          .pipe(retrier())
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
  return state.mdl$;
}

export const post = (mp: MdlPost) => {
  checkPostState('account', state, postAck$);
  postAck$ = new Subject();
  const subscpt = ajax.post<Get>(`${baseUrl}/accounts`, toPost(mp))
    .pipe(retrier())
    .subscribe({
      next: rsp => {
        subscpt.unsubscribe(); // this is async so subscpt always set
        const tmp$ = postAck$;
        postAck$ = undefined;

        const g = rsp.response;

        tmp$?.complete();
      },
      error: e => {
        const tmp$ = postAck$;
        postAck$ = undefined;
        tmp$?.error(e);
      }
    });
  return postAck$;
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
