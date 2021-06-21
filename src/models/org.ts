import * as base from './mdl'
import { ajax } from 'rxjs/ajax';
import { baseUrl } from '../utils/config';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import * as user from './user';
import retrier from './retrier';
import * as descs from './descs';
import * as actts from './actts';
import { CloseGet, FundGet, Get, Post, RoleGet, TldrGet, UserGet } from '../api/orgs';
import { toDate } from '../common/acctdate';

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
  roles: base.Arr<Role>;
};
const fromUserGet = (g: UserGet): User => ({
  id: g.id,
  roles: base.makeArr(g.roles, fromRoleGet)
});
const cmplUser = (m: User) => base.arrCmpl(m.roles);

export type FundChg = {
  tag?: string;
  begAt?: Date;
  desc?: descs.Chg;
};
export type Fund = base.Chgable<FundChg> & {
  id: number;
  tag: string;
  begAt: Date;
  at: Date;
  desc: descs.Mdl;
  actts: base.Arr<actts.Mdl>;
};
const fromFundGet = (g: FundGet): Fund => ({
  ...base.makeChgable(),
  id: g.id,
  tag: g.tag,
  begAt: toDate(g.begAt),
  at: toDate(g.at),
  desc: descs.fromGet(g.desc),
  actts: base.makeArr(g.actts, actts.fromGet)
});
const cmplFund = (m: Fund) => {
  base.arrCmpl(m.actts);
  base.cmpl(m);
};

export type CloseChg = {
  desc?: descs.Chg;
};
export type Close = base.Chgable<CloseChg> & {
  id: number;
  endAt: Date;
  at: Date;
  desc: descs.Mdl;
};
const fromCloseGet = (g: CloseGet): Close => ({
  ...base.makeChgable(),
  id: g.id,
  endAt: toDate(g.endAt),
  at: toDate(g.at),
  desc: descs.fromGet(g.desc)
});
const cmplClose = (m: Close) => base.cmpl(m);

export type Chg = { // TldrMdl and Mdl
  name?: string;
  begAt?: Date;
  desc?: descs.Chg;
};

export type TldrMdl = base.Rsc<Chg> & {
  saId: string;  
  name: string;
  begAt: Date;
  desc: descs.Mdl;
  users: base.Arr<User>;
};
const tldrFromGet = (g: TldrGet): TldrMdl => ({
  ...base.fromGet(g),
  saId: g.saId,
  name: g.name,
  begAt: toDate(g.begAt),
  desc: descs.fromGet(g.desc),
  users: base.makeArr(g.users, fromUserGet)
});
const tldrCmpl = (m: TldrMdl) => {
  base.arrCmpl(m.users, cmplUser);
  base.cmpl(m);
};

export type Mdl = TldrMdl & {
  funds: base.Arr<Fund>;
  clos: base.Arr<Close>;
};
const fromGet = (g: Get): Mdl => ({
  ...tldrFromGet(g),
  funds: base.makeArr(g.funds, fromFundGet),
  clos: base.makeArr(g.clos, fromCloseGet),
});
const cmpl = (m: Mdl) => {
  base.arrCmpl(m.funds, cmplFund);
  base.arrCmpl(m.clos, cmplClose);
  tldrCmpl(m);
};

export type TldrMdls = base.Hash<TldrMdl>;
const tldrsFromGets = (gs: TldrGet[]) => base.makeHash(gs, tldrFromGet);
const tldrsCmpl = (m: TldrMdls) => base.hashCmpl(m, tldrCmpl);

class State<T> {
  mdl$ = new ReplaySubject<T>();
  mdl?: T;
  ack$?: Subject<void>;
  subscpt?: Subscription;
  next(mdl: T) {
    this.subscpt?.unsubscribe();
    this.subscpt = undefined;
    this.mdl = mdl;
    this.ack$?.complete(); // keep ack$ so load can be called again (and not load)
    this.mdl$.next(mdl);  
  }
  error(e: Error) { // keep mdl$, report error via ack$, allow retry
    this.subscpt?.unsubscribe();
    this.subscpt = undefined;
    const tmp$ = this.ack$;
    delete this.ack$;
    tmp$?.error(e);  
  }
  cmpl(cmplMdl: (m: T) => void) { // assumes this state already replaced
    this.subscpt?.unsubscribe();
    this.ack$?.error(new Error('user signed out while waiting for load org or invalid session'));
    if (this.mdl) cmplMdl(this.mdl);
    this.mdl$.complete();
  }
};

let mState = new State<Mdl>();
let tmsState = new State<TldrMdls>();

// the returned stream will emit a single next with the org tldrs (when loaded)
// and is completed when the user signs out (no error reported here)
export const getTldrs$ = () => tmsState.mdl$;

// call getTldrs$ first to get the stream then here to initiate the load
// this returns an ack$ stream that reports errors and completion, on
// an error this should be called again
// (calling prior to checking the user session will cause the getTldrs$ 
// stream to complete w/o next)
export const loadTldrs = (): Subject<void> => {
  if (tmsState.ack$) return tmsState.ack$;
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
      tmsState = new State();
      tmp.cmpl(tldrsCmpl);
    }
  });
  return tmsState.ack$;
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
    mState = new State();
    tmp.cmpl(cmpl);
  }
  return mState.mdl$;
}

const ackError = (): Subject<void> => {
  const e$ = new Subject<void>();
  e$.error(new Error('invalid state, set org in progress'));
  return e$;
}

// gets given org and places in get$()/clear$() stream
// returns ack$ that is called on error or completed on success
// note that this will automatically call clear$() if prev org 
// still set, in which case get$() will need to be called
export const set = (id: string): Subject<void> => {
  if (mState.ack$) return ackError();
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
      mState = new State();
      tmp.cmpl(cmpl);  
    }
  });
  return mState.ack$;
};

export const post = (org: Post) => {
  ajax.post<Get>(`${baseUrl}/orgs`)
    .pipe(retrier())
    .subscribe({
      next: org => {
        // TODO oId = org.id; 
        // TODO
        // org$.next(fromSvc(org));
      }});

};
