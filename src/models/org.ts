import * as base from './base'
import { ajax } from 'rxjs/ajax';
import { baseUrl } from '../utils/config';
import { EMPTY, ReplaySubject, Subject } from 'rxjs';
import * as user from './user';
import retrier from './retrier';
import { catchError } from 'rxjs/operators';
import * as descs from './descs';
import * as actts from './actts';
import { CloseGet, FundGet, Get, RoleGet, UserGet } from '../api/orgs';
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

// export type Roles = base.ArrMdl<Role>;

// const fromRoleGets = (gs: RoleGet[]): Roles => ({
//   arr: gs.map(fromRoleGet),
//   chg$: new Subject<base.ArrChg<Role>>()
// });
// const compRoles = (m: Roles) => m.chg$.complete();

export type User = {
  id: string;
  roles: base.Arr<Role>;
};

const fromUserGet = (g: UserGet): User => ({
  id: g.id,
  roles: base.makeArr(g.roles, fromRoleGet)
});
const compUser = (m: User) => base.cmpl(m.roles);

export type Users = base.ArrWChg<User>;

const fromUserGets = (gs: UserGet[]): Users => ({
  arr: gs.map(fromUserGet),
  chg$: new Subject<base.ArrChg<User>>()
});
const compUsers = (m: Users) => {
  m.arr.map(compUser);
  m.chg$.complete();
};

export type Fund = {
  id: number;
  tag: string;
  begAt: Date;
  at: Date;
  desc: descs.Mdl;
  actts: actts.Mdl[];
};

const fromFundGet = (g: FundGet): Fund => ({
  id: g.id,
  tag: g.tag,
  begAt: toDate(g.begAt),
  at: toDate(g.at),
  desc: descs.fromGet(g.desc),
  actts: g.actts.map(actts.fromGet)
});

export type Close = {
  id: number;
  endAt: Date;
  at: Date;
  desc: descs.Mdl;
};

const fromCloseGet = (g: CloseGet): Close => ({
  id: g.id,
  endAt: toDate(g.endAt),
  at: toDate(g.at),
  desc: descs.fromGet(g.desc)
});

export type Chg = {
  name?: string;
  desc?: descs.Chg;
};

export type OrgTldr = base.Rsc<Chg> & {
  saId: string;  
  name: string;
  begAt: Date;
  desc: descs.Mdl;
  users: User[];
};

const tldrFromGet = (g: Get): OrgTldr => ({
  ...base.fromGet(g),
  saId: g.saId,
  name: g.name,
  begAt: toDate(g.begAt),
  desc: descs.fromGet(g.desc),
  users: g.users.map(fromUserGet)
});

export type Org = OrgTldr & {
  funds?: Fund[];
  clos?: Clos;
};

export type Orgs = base.ObjOfMdls<Org>;

const fromGet = (g: Get): Org => ({
  ...tldrFromGet(g),
  
});

let chg$WOrgs: Chg$WOrgs | undefined;
let chg$WOrgs$ = new ReplaySubject<Chg$WOrgs>(1);
let loadState = 0;
let org$ = new ReplaySubject<Org>(1);
let oId = '';

const load = () => {
  ajax.getJSON<Get[]>(`${baseUrl}/orgs`)
  .pipe(retrier(), catchError(() => {loadState = 0; return EMPTY;}))
  .subscribe({
    next: orgs => {
      chg$WOrgs$.next(orgs.map(fromGet).reduce((o: Chg$WOrgs, v: Org) => {
        o.mdl[v.id] = v;
        return o;
      }, {chg$: new Subject<OrgsChg>(), mdl: {}} as Chg$WOrgs));
    }
  });
}

const complete = () => {
  clearOrg();
  const tmp$ = chg$WOrgs$;
  chg$WOrgs$ = new ReplaySubject(1);
  chg$WOrgs = undefined;
  tmp$.complete();
}

export const getChg$WOrgs$ = () => {
  if (!loadState) {
    loadState = 1;
    user.get$().subscribe({ // user signed in event
      next: load,
      complete: complete
    });
  }
  return chg$WOrgs$;
};

const clearOrg = () => {
  if (oId) {
    oId = '';
    const tmp$ = org$;
    org$ = new ReplaySubject<Org>(1);
    tmp$.complete();
  }
};

export const get$ = () => org$;

export const set = (id: string) => {
  clearOrg();
  ajax.getJSON<Get>(`${baseUrl}/orgs/${id}`)
    .pipe(retrier())
    .subscribe({
      next: org => {
        oId = id;
        org$.next(fromGet(org));
      }});
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
