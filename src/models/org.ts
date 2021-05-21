import { All, AllChg, BaseMdl, BaseSvc } from './base'
import { ajax } from 'rxjs/ajax';
import { baseUrl } from '../utils/config';
import { ReplaySubject, Subject } from 'rxjs';
import * as user from './user';

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
let userSubscribed = false;
let org$ = new ReplaySubject<Org>(1);
let orgSelected = false;

export const getAll$ = () => {
  if (!userSubscribed) {
    userSubscribed = true;
    user.get$().subscribe({
      next: user =>
        ajax.getJSON<OrgSvc[]>(`${baseUrl}/orgs`)
          .subscribe({
            next: orgs => {
              all$.next(orgs.map(fromSvc).reduce((o: All<Org>, v: Org) => {
                o[v.id] = v;
                return o;
              }, {chg$: new Subject<AllChg<Org>>()} as All<Org>));
            }
          }),
      complete: () => {
        const tmp$ = all$;
        all$ = new ReplaySubject<All<Org>>(1);
        tmp$.complete();
      }
    });
  }
  return all$;
};

export const set = (id: string) => {
  if (orgSelected) {
    orgSelected = false;
    const tmp$ = org$;
    org$ = new ReplaySubject<Org>(1);
    tmp$.complete();
  }
  ajax.getJSON<OrgSvc>(`${baseUrl}/orgs/${id}`) // TODO retry
    .subscribe({
      next: org => {
        org$.next(fromSvc(org));
      }
    });
}