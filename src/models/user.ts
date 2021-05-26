import { BaseMdl, BaseSvc } from './base'
import { ajax } from 'rxjs/ajax';
import { baseUrl } from '../utils/config';
import { ReplaySubject, Subject } from 'rxjs';
import retrier from './retrier';

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
const isInitSessionValid$: Subject<boolean> = new ReplaySubject<boolean>(1);
let initSessionCheckState = 0;

const load = (err401Ok?: boolean) => {
  const rty = err401Ok ? {throwOnError: true} : {};
  ajax.getJSON<UserSvc[]>(`${baseUrl}/users?ses=1`)
    .pipe(retrier(rty))
    .subscribe({
      next: rsp => {
        if (rsp.length !== 1) {
          console.log('unknown get user response');
          if (initSessionCheckState < 2) {
            initSessionCheckState = 2;
            isInitSessionValid$.next(false);
          }
          return;
        }
        // session still valid
        userEmail = rsp[0].email;
        if (initSessionCheckState < 2) {
          initSessionCheckState = 2;
          isInitSessionValid$.next(true);
        }
        user$.next(fromSvc(rsp[0]));
      },
      error: err => {
        
        // TODO redo error handling vis-a-vis err401Ok
        
        if (err.status === 401 && err401Ok) {
          // OK no real error, no valid session
          console.log(`OK, no valid session: ${err.message}`);
        } else {
          console.log(`error checking session, ignoring: ${err.message}`);
        }
        if (initSessionCheckState < 2) {
          initSessionCheckState = 2;
          isInitSessionValid$.next(false);
        }
      }
    });
};

export const getIsInitSessionValid$ = () => {
  if (!initSessionCheckState) {
    // setting flag and getting an error will force user to sign in
    // note that we do not display any error, signing in will do that
    // if the problem still persists
    initSessionCheckState = 1;
    load(true);
  }
  return isInitSessionValid$;
}

export const get$ = (): Subject<User> => {
  getIsInitSessionValid$();
  return user$;
};

export type Creds = {
  email: string;
  pswd: string;
};

const checkForErrors = (api: number, email?: string) => {
  // check for programming errors
  if (0 && userEmail) {console.log('still signed in'); return true;}
  if (1 && userEmail) {
    console.log(`already signed in${userEmail !== email ? ' under different email' : ''}`);
    return true;
  }
  if (2 && !userEmail) {console.log('already signed out'); return true;}
  if (initSessionCheckState < 2) {
    console.log('init session not checked, use getIsInitSessionValid$()');
    return true;
  }
  return false;
}

export const register = ({email, pswd}: Creds) => {
  if (checkForErrors(0)) return;
  // TODO display alert to check user email
  ajax.post<void>(`${baseUrl}/users`, {email, pswd})
    .pipe(retrier())
    .subscribe({
      next: () => {}
    });
};

export const signIn = ({email, pswd}: Creds) => {
  if (checkForErrors(1, email)) return;
  ajax.post<void>(`${baseUrl}/sessions`, {email, pswd})
    .pipe(retrier())
    .subscribe({
      next: () => load() // GET user
    });
};

export const signOut = () => {
  if (checkForErrors(2)) return;
  ajax.delete<void>(`${baseUrl}/sessions`)
    .pipe(retrier())
    .subscribe({
      next: () => {
        userEmail = '';
        const tmp$ = user$;
        user$ = new ReplaySubject<User>(1);
        tmp$.complete();
      }
    });
};