import { BaseMdl, BaseSvc } from './base'
import { ajax } from 'rxjs/ajax';
import { baseUrl } from '../utils/config';
import { ReplaySubject, Subject } from 'rxjs';

type UserSvc = BaseSvc & {
  id: string,
  email: string,
  fName: string,
  lName?: string,
};

type UserChg = {
  email?: string,
  fName?: string,
  lName?: string,
};

export type User = BaseMdl<UserChg> & UserSvc;

const fromSvc = (o: UserSvc): User => ({
  ...o,
  chg$: new Subject<UserChg>()
});

let user$: Subject<User> = new ReplaySubject<User>(1);
let userEmail = '';
let sessionChecked = false;

const getUser = (err401Ok?: boolean) => {
  ajax.getJSON<UserSvc[]>(`${baseUrl}/users?ses=1`)
    .subscribe({ // TODO retry
      next: rsp => {
        if (!rsp.length) {
          console.log('unknown response');
          return;
        }
        // session still valid (will throw 401 if ses invalid)
        userEmail = rsp[0].email;
        user$.next(fromSvc(rsp[0]));
      },
      error: err => {
        if (err.status === 401 && err401Ok) {
          // OK, no valid session
        }
        // TODO else retry
      }
    });
};

export const get$ = (): Subject<User> => {
  if (!sessionChecked) {
    sessionChecked = true;
    getUser(true);
  }
  return user$;
};

export const signIn = (email: string, pswd: string) => {
  if (userEmail) {
    console.log(`already signed in${userEmail !== email ? ' under different email' : ''}`); // TODO err msg
    return;
  }
  ajax.post<void>(`${baseUrl}/sessions`, {email, pswd}) // TODO retry
    .subscribe({
      next: () => getUser()
    });
};

export const signOut = () => {
  if (!userEmail) {
    console.log('already signed out'); // TODO warn
    return;
  }
  ajax.delete<void>(`${baseUrl}/sessions`) // TODO retry
    .subscribe({
      next: () => {
        userEmail = '';
        const tmp$ = user$;
        user$ = new ReplaySubject<User>(1);
        tmp$.complete();
      }
    });
};