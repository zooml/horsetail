import * as mdl from './mdl'
import { ajax } from 'rxjs/ajax';
import { baseUrl } from '../utils/config';
import { ReplaySubject, Subject } from 'rxjs';
import * as user from './user';
import retrier from './retrier';
import * as descs from './descs';
import * as actts from './actts';
import { CloseGet, FundGet, Get, Post, RoleGet, TldrGet, UserGet } from '../api/orgs';
import { fromDate, toDate } from '../utils/clndate';
import GlbState, { ackError } from './glbstate';

export type Role = {
  id: number;
  uId: string;
  at: Date;
};
const fromRoleGet = (g: RoleGet): Role => ({
  id: g.id,
  uId: g.uId,
  at: toDate(g.at)
});

export type User = {
  id: string;
  roles: mdl.Arr<Role>;
};
const fromUserGet = (g: UserGet): User => ({
  id: g.id,
  roles: mdl.makeArr(g.roles, fromRoleGet)
});
const cmplUser = (m: User) => mdl.arrCmpl(m.roles);

export type FundChg = {
  tag?: string;
  begAt?: Date;
  desc?: descs.Chg;
};
export type Fund = mdl.Chgable<FundChg> & {
  id: number;
  tag: string;
  begAt: Date;
  at: Date;
  desc: descs.Mdl;
  actts: mdl.Arr<actts.Mdl>;
};
const fromFundGet = (g: FundGet): Fund => ({
  ...mdl.makeChgable(),
  id: g.id,
  tag: g.tag,
  begAt: toDate(g.begAt),
  at: toDate(g.at),
  desc: descs.fromGet(g.desc),
  actts: mdl.makeArr(g.actts, actts.fromGet)
});
const cmplFund = (m: Fund) => {
  mdl.arrCmpl(m.actts);
  mdl.cmpl(m);
};

export type CloseChg = {
  desc?: descs.Chg;
};
export type Close = mdl.Chgable<CloseChg> & {
  id: number;
  endAt: Date;
  at: Date;
  desc: descs.Mdl;
};
const fromCloseGet = (g: CloseGet): Close => ({
  ...mdl.makeChgable(),
  id: g.id,
  endAt: toDate(g.endAt),
  at: toDate(g.at),
  desc: descs.fromGet(g.desc)
});
const cmplClose = (m: Close) => mdl.cmpl(m);

export type Chg = { // TldrMdl and Mdl
  name?: string;
  begAt?: Date;
  desc?: descs.Chg;
};

export type TldrMdl = mdl.Rsc<Chg> & {
  saId: string;  
  name: string;
  begAt: Date;
  desc: descs.Mdl;
  users: mdl.Arr<User>;
};
const tldrFromGet = (g: TldrGet): TldrMdl => ({
  ...mdl.fromGet(g),
  saId: g.saId,
  name: g.name,
  begAt: toDate(g.begAt),
  desc: descs.fromGet(g.desc),
  users: mdl.makeArr(g.users, fromUserGet)
});
const tldrCmpl = (m: TldrMdl) => {
  mdl.arrCmpl(m.users, cmplUser);
  mdl.cmpl(m);
};

export type Mdl = TldrMdl & {
  funds: mdl.Arr<Fund>;
  clos: mdl.Arr<Close>;
};
export type MdlPost = {
  name: string;
  begAt: Date;
  desc?: descs.MdlPost;
}
const fromGet = (g: Get): Mdl => ({
  ...tldrFromGet(g),
  funds: mdl.makeArr(g.funds, fromFundGet),
  clos: mdl.makeArr(g.clos, fromCloseGet),
});
const toPost = (mp: MdlPost): Post => {
  const p: Post = {
    name: mp.name,
    begAt: fromDate(mp.begAt)
  };
  if (mp.desc) p.desc = descs.toPost(mp.desc);
  return p;
};
const cmpl = (m: Mdl) => {
  mdl.arrCmpl(m.funds, cmplFund);
  mdl.arrCmpl(m.clos, cmplClose);
  tldrCmpl(m);
};

export type TldrMdls = mdl.Hash<TldrMdl>;
const tldrsFromGets = (gs: TldrGet[]) => mdl.makeHash(gs, tldrFromGet);
const tldrsCmpl = (m: TldrMdls) => mdl.hashCmpl(m, tldrCmpl);

let mState = new GlbState<Mdl>('org');
let tmsState = new GlbState<TldrMdls>('tldr orgs');
let postAck$: Subject<void> | undefined;

// the returned stream will emit a single next with the org tldrs (when loaded)
// and is completed when the user signs out (no error reported here)
export const getTldrs$ = () => {
  if (!tmsState.mdl && !tmsState.ack$) {
    tmsState.ack$ = new Subject<void>();
    user.get$().subscribe({ // user signed in event
      next: () =>
        tmsState.subscpt = ajax.getJSON<TldrGet[]>(`${baseUrl}/orgs`)
          .pipe(retrier())
          .subscribe({ // async so subscpt must have been set
            next: gs => tmsState.next(tldrsFromGets(gs)),
            error: e => tmsState.error(e)
          }),
      complete: () => { // user signed out
        const tmp = tmsState; // reset state first
        tmsState = new GlbState(tmp);
        tmp.cmpl(tldrsCmpl);
      }
    });
  }
  return tmsState.mdl$;
};

// returns stream containing current org, or that will contain
// org after call to set(id)
export const get$ = (): ReplaySubject<Mdl> => mState.mdl$;

// clears the current org, if any, and returns a stream that
// will push the org read by subsequent call to set(id)
export const clear$ = (): ReplaySubject<Mdl> => {
  if (mState.ack$) {
    console.log('cannot clear, waiting for org set');
    return mState.mdl$;
  }
  if (mState.mdl) {
    const tmp = mState;
    mState = new GlbState(tmp);
    tmp.cmpl(cmpl);
  }
  return mState.mdl$;
}

// gets given org and places in get$()/clear$() stream
// returns ack$ that is called on error or completed on success
// note that this will automatically call clear$() if prev org 
// still set, in which case get$() will need to be called
export const set = (id: string): Subject<void> => {
  if (postAck$) return ackError('org: invalid state, post in progress');
  if (mState.ack$) return ackError('org: invalid state, set org in progress');
  if (mState.mdl) clear$(); // existing org
  mState.ack$ = new Subject<void>();
  user.get$().subscribe({ // user signed in event
    next: () =>
      mState.subscpt = ajax.getJSON<Get>(`${baseUrl}/orgs/${id}`)
        .pipe(retrier())
        .subscribe({
          next: g => mState.next(fromGet(g)),
          error: e => mState.error(e)
        }),
    complete: () => { // user signed out
      const tmp = mState; // reset state first
      mState = new GlbState(tmp);
      tmp.cmpl(cmpl);  
    }
  });
  return mState.ack$;
};

const addToTldrMdls = (g: TldrGet) => {
  if (!tmsState.mdl) throw new Error('org: post completed and tldr orgs missing');
  const m = tldrFromGet(g);
  mdl.addToMdl(tmsState.mdl, m, m.id);
}

// create an org, on success this will add to the tldrs orgs and if there
// is no current org it will make it the current org (i.e. push into the stream)
// returns an ack$ that will report error or success (complete)
export const post = (mp: MdlPost): Subject<void> => {
  if (mState.ack$) return ackError('org: invalid state, another operation in progress');
  if (postAck$) return ackError('org: invalid state, previous post still in progress');
  if (!tmsState.mdl) return ackError('org: invalid state, must get tldr orgs first');
  postAck$ = new Subject();
  const subscpt = ajax.post<Get>(`${baseUrl}/orgs`, toPost(mp))
    .pipe(retrier())
    .subscribe({
      next: rsp => {
        subscpt.unsubscribe(); // this is async so subscpt always set
        const g = rsp.response;
        addToTldrMdls(g);
        const tmp$ = postAck$;
        postAck$ = undefined;
        if (!mState.mdl) { // since no current org, do set() action
          mState.ack$ = tmp$;
          mState.next(fromGet(g));
        } else {
          tmp$?.complete();
        }
      },
      error: e => {
        const tmp$ = postAck$;
        postAck$ = undefined;
        tmp$?.error(e);
      }
    });
  return postAck$;
};
