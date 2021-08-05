import { ajax, AjaxConfig } from 'rxjs/ajax';
import { ReplaySubject, Subject } from 'rxjs';
import { baseUrl } from '../utils/config';
import * as mdl from './mdl';
import * as descs from './descs';
import { AdjGet, AdjPost, Get, Post } from '../api/txndocs';
import { fromDate, toDate, today } from '../utils/clndate';
import { makeArr } from './mdl';
import GlbState, { checkPostState } from './glbstate';
import * as org from './org';
import retrier from './retrier';
import binsrch from '../utils/binsrch';

export type AdjMdl = AdjGet;
export type AdjMdlPost = AdjPost;
const fromAdjGet = (g: AdjGet): AdjMdl => g;
const toAdjPost = (mp: AdjMdlPost): AdjPost => mp;

export type Chg = {
  begAt?: Date;
  adjs?: AdjPost[];
  dueAt?: Date;
  desc?: descs.Chg;
};
export type Mdl = mdl.Rsc<Chg> & {
  oId: string;
  begAt: Date;
  adjs: mdl.Arr<AdjMdl>;
  tdTId: number;
  dueAt?: Date;
  desc: descs.Mdl;
};
export type MdlPost = {
  begAt: Date;
  adjs: AdjMdlPost[];
  tdTId?: number;
  dueAt?: Date;
  desc?: descs.MdlPost;
};
const fromGet = (g: Get): Mdl => {
  const m: Mdl = {
    ...mdl.fromGet(g),
    oId: g.oId,
    begAt: toDate(g.begAt),
    adjs: makeArr(g.adjs, fromAdjGet),
    tdTId: g.tdTId,
    desc: descs.fromGet(g.desc)
  };
  if (g.dueAt) m.dueAt = toDate(g.dueAt);
  return m;
};
const toPost = (mp: MdlPost): Post => {
  const p: Post = {
    begAt: fromDate(mp.begAt ? mp.begAt : today()),
    adjs: mp.adjs.map(toAdjPost)
  };
  if (mp.tdTId) p.tdTId = mp.tdTId;
  if (mp.dueAt) p.dueAt = fromDate(mp.dueAt);
  return p;
};
const cmpl = (m: Mdl) => {
  mdl.arrCmpl(m.adjs);
  mdl.cmpl(m);
};

export type Mdls = mdl.Arr<Mdl>;
const mdlsCmpl = (ms: Mdls) => mdl.arrCmpl(ms, cmpl);

let curOrg: org.Mdl | undefined;
let mdls: Mdls = mdl.makeEmptyArr();
let state = new GlbState<Mdls>('txndocs');
let postAck$: Subject<void> | undefined;

const cmp = (m0: Mdl, m1: Mdl) => 
  m0.begAt < m1.begAt
    ? 1
    : (m0.begAt.getTime() === m1.begAt.getTime()
      ? (m0.at < m1.at
          ? 1
          : (m0.at.getTime() === m1.at.getTime()
            ? 0
            : -1))
      : -1);

const getPage = (npage?: string) => {
  const qp = npage ? {queryParams: {page: npage}} : {};
  const config: AjaxConfig = {...qp, url: `${baseUrl}/txndocs`, method: 'GET', 
    headers: mdl.hdrs(curOrg?.id), 
    responseType: 'json'};
  state.subscpt = ajax<Get[]>(config)
    .pipe(retrier())
    .subscribe({
      next: res => {
        mdls.push(...res.response.map(fromGet));
        const npg = res.responseHeaders['x-npage']; // TODO const
        if (npg) {
          state.subscpt?.unsubscribe();
          getPage(npg);
        } else {
          state.next(mdls);
        }
      },
      error: e => {
        mdls = mdl.makeEmptyArr();
        state.error(e);
      }
    })
};

// returns stream containing current txndocs array, or that will contain
// array after org.set(id), and successful get of txndocs
// does not report errors, completes on org clear
export const get$ = (): ReplaySubject<Mdls> => {
  if (!state.mdl && !state.ack$) {
    mdls = mdl.makeEmptyArr();
    state.ack$ = new Subject();
    org.get$().subscribe({
      next: org => {
        curOrg = org;
        getPage();
      },
      complete: () => { // org cleared, user sign out, etc.
        curOrg = undefined;
        const tmp = state;
        state = new GlbState(tmp);
        tmp.cmpl(mdlsCmpl);
      }
    });
  }
  return state.mdl$;
};

export const post = (mp: MdlPost) => {
  checkPostState(state, postAck$);
  postAck$ = new Subject();
  const subscpt = ajax.post<Get>(`${baseUrl}/txndocs`, toPost(mp), mdl.hdrs(curOrg?.id))
    .pipe(retrier())
    .subscribe({
      next: rsp => {
        subscpt.unsubscribe(); // this is async so subscpt always set
        const tmp$ = postAck$;
        postAck$ = undefined;
        tmp$?.complete();
        mdl.add(mdls, fromGet(rsp.response), cmp);
      },
      error: e => {
        const tmp$ = postAck$;
        postAck$ = undefined;
        tmp$?.error(e);
      }
    });
  return postAck$;
};
