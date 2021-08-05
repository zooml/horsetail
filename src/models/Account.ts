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
import binsrch from '../utils/binsrch';

export type CloseMdl = CloseGet;
const fromCloseGet = (g: CloseGet): CloseMdl => g;

export type Chg = {
  num?: number;
  name?: string;
  desc?: descs.Chg;
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
  desc?: descs.MdlPost;
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

const cmp = (m0: Mdl, m1: Mdl) => m0.num - m1.num;

const addToArray = (acct: Mdl, arr: mdl.Arr<Mdl>, init?: boolean) => {
  if (init) arr.splice(binsrch(arr, acct, cmp), 0, acct);
  else mdl.add(arr, acct, cmp);
};

const initAcct = (acct: Mdl, sum?: Mdl) => {
  if (acct.tmpCatId) { // init general account
    if (acct.tmpSumId) throw new Error(`account ${acct.id}: category on non-general account`);
    const category = CATEGORIES[acct.tmpCatId];
    if (!category) throw new Error(`account ${acct.id}: invalid category: ${acct.tmpCatId}`);
    delete acct.tmpCatId;
    acct.cat = category;
    acct.isCr = category.isCr;
  } else if (sum) { // should always be sum if not cat id
    if (acct.tmpSumId !== sum.id) throw new Error(`account ${acct.id}: sum id mismatch`);
    delete acct.tmpSumId;
    acct.sum = sum;
    acct.cat = sum.cat; // inherit
    const svcIsCr = acct.svcIsCr;
    if (svcIsCr !== undefined) {
      acct.isCr = svcIsCr;
    } else { // inherit
      acct.isCr = sum.isCr;
    }
  }
};

const initAcctFromAll = (all: {[k: string]: Mdl}, gens: {[k: string]: Mdl}, acct: Mdl) => {
  if (acct.tmpCatId) { // init general account
    initAcct(acct);
    if (acct.cat.id in gens) throw new Error(`account ${acct.id}: general account already exists: ${CATEGORIES[acct.cat.id].tag}`);
    gens[acct.cat.id] = acct;
  } else if (acct.tmpSumId) { // init non-general account
    const sum = all[acct.tmpSumId];
    if (!sum) throw new Error(`account ${acct.id}: invalid parent id: ${acct.tmpSumId}`);
    if (sum.tmpCatId || sum.tmpSumId) { // sum not init, recurse to ancestors
      initAcctFromAll(all, gens, sum);
    }
    initAcct(acct, sum);
    addToArray(acct, sum.subs, true);
  }
};

const addAcct = (acct: Mdl, sum?: Mdl) => {
  initAcct(acct, sum);
  addToArray(acct, sum ? sum.subs : state.mdl!);
};

// chart of accounts, these are the general accounts with recursive sub accounts
// all levels are sorted by num
export type Chart = mdl.Arr<Mdl>;
const chartFromGets = (gs: Get[]): Chart => {
  const all: {[k: string]: Mdl} = {};
  const gens: {[k: string]: Mdl} = {};
  gs.forEach(acct => {all[acct.id] = fromGet(acct);});
  for (const acct of Object.values(all)) {
    initAcctFromAll(all, gens, acct);
  }
  const chart: Chart = mdl.makeArr(Object.values(gens), m => m);
  return chart.sort((o0: Mdl, o1: Mdl) => o0.num - o1.num);
};
const chartCmpl = (c: Chart) => mdl.arrCmpl(c, cmpl);

let curOrg: org.Mdl | undefined;
let state = new GlbState<Chart>('chart');
let postAck$: Subject<void> | undefined;

// returns stream containing current chart, or that will contain
// chart after call to org.set(id), and successful get of accounts
// does not report errors, completes on org clear
export const get$ = (): ReplaySubject<Chart> => {
  if (!state.mdl && !state.ack$) {
    state.ack$ = new Subject();
    org.get$().subscribe({
      next: org => {
        curOrg = org;
        state.subscpt = ajax.getJSON<Get[]>(`${baseUrl}/accounts`, mdl.hdrs(curOrg.id))
          .pipe(retrier())
          .subscribe({
            next: gs => state.next(chartFromGets(gs)),
            error: e => state.error(e)
          })
      },
      complete: () => { // org cleared, user sign out, etc.
        curOrg = undefined;
        const tmp = state;
        state = new GlbState(tmp);
        tmp.cmpl(chartCmpl);
      }
    });
  }
  return state.mdl$;
}

export const post = (mp: MdlPost) => {
  checkPostState(state, postAck$);
  postAck$ = new Subject();
  const subscpt = ajax.post<Get>(`${baseUrl}/accounts`, toPost(mp), mdl.hdrs(curOrg?.id))
    .pipe(retrier())
    .subscribe({
      next: rsp => {
        subscpt.unsubscribe(); // this is async so subscpt always set
        const tmp$ = postAck$;
        postAck$ = undefined;
        tmp$?.complete();
        addAcct(fromGet(rsp.response), mp.sum);
      },
      error: e => {
        const tmp$ = postAck$;
        postAck$ = undefined;
        tmp$?.error(e);
      }
    });
  return postAck$;
};

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
