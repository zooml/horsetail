import { ReplaySubject } from 'rxjs';
import * as account from '../models/account';

let sel$ = new ReplaySubject<account.Mdl>(1);
let isSet = false;

export const get$ = () => sel$;

export const clear = () => {
  if (isSet) {
    isSet = false;
    const tmp$ = sel$;
    sel$ = new ReplaySubject<account.Mdl>(1);
    tmp$.complete();
  }
};

export const set = (acct: account.Mdl) => {
  if (isSet) clear();
  isSet = true;
  sel$.next(acct);
};
