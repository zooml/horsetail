import * as base from './mdl'
import { ajax } from 'rxjs/ajax';
import { baseUrl } from '../utils/config';
import { ReplaySubject, Subject } from 'rxjs';
import retrier, { RetryOpts } from './retrier';
import * as alert from '../models/alert';
import { Get, Base, Post } from '../api/users';
import * as sessions from '../api/sessions';
import * as descs from './descs';
import GlbState from './glbstate';

export type Chg = {
  email?: string;
  fName?: string;
  lName?: string;
};

export type Mdl = base.Rsc<Chg> & Base;
export type MdlPost = Post;
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
const toPost = (mp: MdlPost): Post => {
  const p: Post = {
    email: mp.email,
    pswd: mp.pswd,
    fName: mp.fName,
  };
  if (mp.lName) p.lName = mp.lName;
  if (mp.desc) p.desc = descs.toPost(mp.desc);
  else p.desc = {}; // TODO needed????
  return p;
};
const cmpl = (m: Mdl | undefined) => base.cmpl(m);

// TIP: After a stream is terminated ( onComplete / onError has been called ), 
// subscriber unsubscribes automatically. You should be able to test
// these behaviors using isUnsubscribed() method on the Subscription object.
// https://stackoverflow.com/questions/41826478/do-i-have-to-unsubscribe-from-completed-observable

// When a new subscriber subscribes to the ReplaySubject instance, it will synchronously
// emit all values in its buffer in a First-In-First-Out (FIFO) manner. 
// The ReplaySubject will also complete, if it has observed completion; 
// and it will error if it has observed an error (note same as Subject).
// https://rxjs.dev/api/index/class/ReplaySubject

let state = new GlbState<Mdl>('user');

const hndlError = (e: any) => { // special handling due to initial session check
  let error;
  const status = ('status' in e) ? e['status'] as number : -1;
  const msg = (e instanceof Error) ? e.message : '<unknown>';
  if (state.first) { // complete w/o having gotten a valid user
    if (status === 401) {
      console.log('user: no valid initial session');
    } else {
      console.log(`user: error checking session, ignoring: ${msg}`);
    }
  } else { // "normal" get user error on sign-in, alert will tell user what to do
    error = (e instanceof Error) ? e : new Error('unknown error');
  }
  return error;
};

const load = () => {
  const opts = state.first ? {noAlertStatus: 401} : {};
  state.unsubscribe();

  // state.subscpt = ajax<string>({
  //   url: `${baseUrl}/users`,
  //   crossDomain: true,
  //   withCredentials: true,
  //   method: 'GET',
  //   headers: {'Accept': 'application/json'},
  // })
  // .pipe(retrier(opts))
  // .subscribe({
  //   next: res => state.next(fromGet(JSON.parse(res.response)[0])),
  //   error: e => {
  //     const error = hndlError(e);
  //     if (error) state.error(error);
  //     else { // init session check done
  //       const tmp = state;
  //       state = new GlbState(tmp);
  //       tmp.cmpl(cmpl);
  //     }
  //   }
  // });

  state.subscpt = ajax.getJSON<Get[]>(`${baseUrl}/users`)
    .pipe(retrier(opts))
    .subscribe({
      next: gs => state.next(fromGet(gs[0])),
      error: e => {
        const error = hndlError(e);
        if (error) state.error(error);
        else { // init session check done
          const tmp = state;
          state = new GlbState(tmp);
          tmp.cmpl(cmpl);
        }
      }
    });
};

// the first call will test the session and get the user's info
// if valid, the user mdl will be put in the returned stream, otherwise
// the stream is marked complete regardless of errors (and a new stream 
// is created) and the user must sign in (or registery/validate email/sign in)
// note that this stream does not report errors only next on sign in and
// complete on sucessfull sign out, errors are reported by
// the ack$ streams returned by the function call to request a state change
export const get$ = (): ReplaySubject<Mdl> => {
  if (!state.subscpt && state.first) {
    load();
  }
  return state.mdl$;
};

const checkStateErrors = (api: number, email?: string) => {
  // check for programming errors
  if (api === 0 && state.mdl) {console.log('still signed in'); return true;}
  if (api === 1 && state.mdl) {
    console.log(`already signed in${state.mdl.email !== email ? ' under different email' : ''}`);
    return true;
  }
  if (api === 2 && !state.mdl) {console.log('already signed out'); return true;}
  if (state.subscpt) {
    console.log('still loading from prev command or initialization');
    return true;
  }
  return false;
}

export const register = (mp: MdlPost): Subject<void> => {
  const ack$ = new Subject<void>();
  if (checkStateErrors(0)) {
    ack$.error(new Error('invalid state for register'));
    return ack$;
  }
  const opts: RetryOpts = {ovrdAlert: {code: 1105, alert: {
    severity: 1,
    message: 'That email address is alredy registered.'
  }}}
  state.subscpt = ajax.post<void>(`${baseUrl}/users`, toPost(mp))
    .pipe(retrier(opts))
    .subscribe({
      next: () => {
        state.unsubscribe();
        alert.push({severity: 3, message: 'Check email for verification link.'});
        ack$.complete();
      },
      error: e => {
        state.unsubscribe();
        ack$.error(e);
      }
    });
  return ack$;
};

export const signIn = ({email, pswd}: sessions.Post): Subject<void> => {
  const ack$ = new Subject<void>();
  if (checkStateErrors(1, email)) {
    ack$.error(new Error('invalid state for signIn'));
    return ack$;
  }
  state.ack$ = ack$;
  const opts: RetryOpts = {ovrdAlert: {
    code: 1201, // TODO put exception in common apperrs.ts
    alert: {severity: 1, message: 'User email or password not recognized.'}
  }};
  state.subscpt = ajax.post<void>(`${baseUrl}/sessions`, {email, pswd})
    .pipe(retrier(opts))
    .subscribe({
      next: () => load(), // chain state to GET user
      error: e => state.error(e)
    });
  return ack$;
};

export const signOut = (): Subject<void> => {
  const ack$ = new Subject<void>();
  if (checkStateErrors(2)) {
    ack$.error(new Error('invalid state for signOut'));
    return ack$;
  }
  state.ack$ = ack$;
  state.subscpt = ajax.delete<void>(`${baseUrl}/sessions`)
    .pipe(retrier())
    .subscribe({
      next: () => { // sign out complete
        const tmp = state;
        state = new GlbState(tmp);
        tmp.cmpl(cmpl);
      },
      error: e => state.error(e) // stay signed in, alert will prompt user to retry
    });
  return ack$;
};