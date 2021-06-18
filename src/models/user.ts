import * as base from './base'
import { ajax } from 'rxjs/ajax';
import { baseUrl } from '../utils/config';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import retrier, { RequestError } from './retrier';
import * as alert from '../models/alert';
import { Get, Base, Creds, Post } from '../api/users';
import * as descs from './descs';

export type Chg = {
  email?: string;
  fName?: string;
  lName?: string;
};

export type Mdl = base.Rsc<Chg> & Base;

const fromGet = (g: Get): Mdl => {
  const m: Mdl = {
    ...base.fromGet(g),
    email: g.email,
    fName: g.fName,
    st: g.st,
    opts: g.opts,
    desc: descs.fromGet(g.desc)
  };
  if (g.lName) m.lName = g.lName;
  return m;
};
const cmpl = (m: Mdl | undefined) => base.cmpl(mdl);

// TIP: After a stream is terminated ( onComplete / onError has been called ), 
// subscriber unsubscribes automatically. You should be able to test
// these behaviors using isUnsubscribed() method on the Subscription object.
// https://stackoverflow.com/questions/41826478/do-i-have-to-unsubscribe-from-completed-observable

// When a new subscriber subscribes to the ReplaySubject instance, it will synchronously
// emit all values in its buffer in a First-In-First-Out (FIFO) manner. 
// The ReplaySubject will also complete, if it has observed completion; 
// and it will error if it has observed an error (note same as Subject).
// https://rxjs.dev/api/index/class/ReplaySubject

let mdl: Mdl | undefined; // set (and in mdl$) if signed in
let mdl$: ReplaySubject<Mdl> = new ReplaySubject<Mdl>(1);
let subscpt: Subscription | undefined;
let isSessionChecked = false;

const done = (result?: Get | Error, ack$?: Subject<void>) => {
  subscpt?.unsubscribe();
  subscpt = undefined;
  const checkingSession = !isSessionChecked;
  isSessionChecked = true;
  if (result && !(result instanceof Error)) { // got user, next
    console.log('user: success');
    mdl = fromGet(result);
    ack$?.complete();
    mdl$.next(mdl);
  } else { // no user, complete or error
    let error;
    if (result) { // must be error
      const status = (result instanceof Error) ? (
        (result instanceof RequestError) ? result.status : 
          ('status' in result) ? result['status'] : -1) : -1;
      const msg = (result instanceof Error) ? result.message : '<unknown>';
      if (checkingSession) {
        if (status === 401) {
          console.log('user: no valid initial session');
        } else {
          console.log(`user: error checking session, ignoring: ${msg}`);
        }
        // complete w/o having gotten a valid user
      } else {
        // "normal" get user error on sign-in, alert will tell user what to do
        error = result;
      }
    }
    const tmp$ = mdl$;
    mdl$ = new ReplaySubject<Mdl>(1);
    const tmp = mdl;
    mdl = undefined;
    cmpl(tmp); // auto-unsubscribe subscribers
    if (error) {
      ack$?.error(error);
      tmp$.error(error);
    } else {
      ack$?.complete();
      tmp$.complete();
    }
  }
}

const load = (ack$?: Subject<void>) => {
  const opts = isSessionChecked ? {} : {noAlertStatus: 401};
  subscpt = ajax.getJSON<Get[]>(`${baseUrl}/users`)
    .pipe(retrier(opts))
    .subscribe({
      next: gs => done(gs[0], ack$),
      error: e => done(e, ack$)
    });
};

// the first call will test the session and get the user's info
// if valid the user mdl will be put in the returned stream, otherwise
// the user must sign in (or registery/validate email/sign in)
export const get$ = (): ReplaySubject<Mdl> => {
  if (!subscpt && !isSessionChecked && !mdl) {
    load();
  }
  return mdl$;
};

const checkStateErrors = (api: number, email?: string) => {
  // check for programming errors
  if (api === 0 && mdl) {console.log('still signed in'); return true;}
  if (api === 1 && mdl) {
    console.log(`already signed in${mdl.email !== email ? ' under different email' : ''}`);
    return true;
  }
  if (api === 2 && !mdl) {console.log('already signed out'); return true;}
  if (subscpt) {
    console.log('still loading from prev command or initialization');
    return true;
  }
  return false;
}

export const register = (p: Post): Subject<void> => {
  const ack$ = new Subject<void>();
  if (checkStateErrors(0)) {
    ack$.error(new Error('invalid state for register'));
    return ack$;
  }
  subscpt = ajax.post<void>(`${baseUrl}/users`, p)
    .pipe(retrier())
    .subscribe({
      next: () => {
        subscpt?.unsubscribe();
        subscpt = undefined;
        alert.push({severity: 3, message: 'Check email for verification link.'});
        ack$.complete();
      },
      error: e => {
        subscpt = undefined;
        ack$.error(e);
      }
    });
  return ack$;
};

export const signIn = ({email, pswd}: Creds): Subject<void> => {
  const ack$ = new Subject<void>();
  if (checkStateErrors(1, email)) {
    ack$.error(new Error('invalid state for signIn'));
    return ack$;
  }
  subscpt = ajax.post<void>(`${baseUrl}/sessions`, {email, pswd})
    .pipe(retrier())
    .subscribe({
      next: () => load(ack$), // GET user
      error: e => {
        subscpt = undefined;
        ack$.error(e);
      }
    });
  return ack$;
};

export const signOut = (): Subject<void> => {
  const ack$ = new Subject<void>();
  if (checkStateErrors(2)) {
    ack$.error(new Error('invalid state for signOut'));
    return ack$;
  }
  subscpt = ajax.delete<void>(`${baseUrl}/sessions`)
    .pipe(retrier())
    .subscribe({
      next: () => done(undefined, ack$),
      error: e => { // stay signed in, alert will prompt user to retry
        subscpt = undefined;
        ack$.error(e);
      }
    });
  return ack$;
};