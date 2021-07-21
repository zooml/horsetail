import { ReplaySubject } from 'rxjs';
import * as account from '../models/account';

let sel$ = new ReplaySubject<account.Mdl>(1);
let sel: account.Mdl | undefined;

export const get$ = () => sel$;

export const clear = () => { // if no acct then "all" is assumed
  if (sel) {
    sel = undefined;
    const tmp$ = sel$;
    sel$ = new ReplaySubject(1);
    tmp$.complete();
  }
};

export const set = (acct: account.Mdl): boolean => {
  if (sel === acct) return false;
  if (sel) clear();
  sel = acct;
  sel$.next(acct);
  return true;
};
