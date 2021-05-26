import { All, AllChg, BaseMdl, BaseSvc } from './base'
import { ajax } from 'rxjs/ajax';
import { baseUrl } from '../utils/config';
import { ReplaySubject, Subject } from 'rxjs';
import * as user from './user';
import retrier from './retrier';

type OrgSvc = BaseSvc & {
  id: string,
  saId: string,
  name: string,
  note?: string,
};

type OrgChg = {
  name?: string,
  note?: string
};

export type Org = BaseMdl<OrgChg> & OrgSvc;

const fromSvc = (o: OrgSvc): Org => ({
  ...o,
  chg$: new Subject<OrgChg>()
});

let all$ = new ReplaySubject<All<Org>>(1);
let hasAll =false;
let org$ = new ReplaySubject<Org>(1);
let oId = '';

const clearOrg = () => {
  if (oId) {
    oId = '';
    const tmp$ = org$;
    org$ = new ReplaySubject<Org>(1);
    tmp$.complete();
  }
};

export const getAll$ = () => {
  if (hasAll) return all$;
  hasAll = true;
  user.get$().subscribe({ // user signed in event
    next: user =>
      ajax.getJSON<OrgSvc[]>(`${baseUrl}/orgs`)
        .pipe(retrier())
        .subscribe({
          next: orgs => {
            all$.next(orgs.map(fromSvc).reduce((o: All<Org>, v: Org) => {
              o[v.id] = v;
              return o;
            }, {chg$: new Subject<AllChg<Org>>()} as All<Org>));
          }
        }),
    complete: () => {
      clearOrg();
      const tmp$ = all$;
      all$ = new ReplaySubject<All<Org>>(1);
      hasAll = false;
      tmp$.complete();
    }
  });
  return all$;
};

export const get$ = () => org$;

export const load = (id: string) => {
  clearOrg();
  ajax.getJSON<OrgSvc>(`${baseUrl}/orgs/${id}`)
    .pipe(retrier())
    .subscribe({
      next: org => {
        oId = id;
        org$.next(fromSvc(org));
      }
    });
}