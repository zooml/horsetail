import { Observable, throwError, timer } from 'rxjs';
import { AjaxError } from 'rxjs/ajax';
import { mergeMap, retryWhen } from 'rxjs/operators';
import msgs from '../utils/msgs';
import * as alert from './alert';

const isNetworkError = (e: AjaxError) => !e.status && !e.response;

export class RequestError extends Error {
  status: number;
  constructor(msg: string, status: number) {
    super(msg);
    this.status = status;
  }
}

// formats msg for user and logs
// use cases:
// 1. network error
// 2. server/gateway error: hopefully tmp down
// 3. some 4xx: shouldn't happen, some client bug (or maybe in server)
const fmtMsg = (e: AjaxError, isNE: boolean, isSE: boolean): [string, string] => {
  if (isNE) {
    const detail = 'req network error';
    console.log(detail);
    return [msgs.NETWORK_ERROR, detail];
  }
  const status = `(${e.status})`;
  if (isSE) { // server does not send body
    const detail = `req server error ${status}`;
    console.log(detail);
    return [`${msgs.SERVER_ERROR} ${status}`, detail];
  }
  const body = e.response;
  const code = body?.code ? `${body?.code}` : '<no code>';
  const statusCode = `(${e.status}, ${code})`;
  const detail = `req unexpected error ${statusCode}: ${body?.message ?? '<no msg>'}`;
  console.log(detail);
  return [`${msgs.UNEXPECTED_ERROR} ${statusCode}`, detail];
};

export type OvrdAlert = {
  alert: alert.Alert;
  code?: number; // only for this error code (else all)
}

export type RetryOpts = {
  maxRetryAttempts?: number;
  delayMs?: number;
  noAlertStatus?: number;
  ovrdAlert?: OvrdAlert;
};

// https://gist.github.com/tanem/011a950b93a89e43cfc335f617dbb230
// TODO what about network errors???? AjaxTimeout????? status === 0 timeout?
// https://www.aurigait.com/blog/error-handling-in-ajax/
// bad domain: {"message":"ajax error","name":"AjaxError","xhr":{},"request":{"async":true,"crossDomain":true,"withCredentials":false,"method":"GET","timeout":0,"responseType":"json","url":"http://asdfasdfadf.com","headers":{"x-requested-with":"XMLHttpRequest"}},"status":0,"responseType":"json","response":null}
//    "message":"ajax error","status":0,"response":null
const retrier = <T>({
  maxRetryAttempts = 3,
  delayMs = 1000,
  noAlertStatus = -1,
  ovrdAlert = undefined
}: RetryOpts = {}) => retryWhen<T>((errors: Observable<AjaxError>) =>
  errors.pipe(
    mergeMap((error, index) => {
      const status = error.status;
      const code = error.response?.code;
      const errorCls = Math.floor(status / 100);
      const isNE = isNetworkError(error);
      const isSE = !isNE && (errorCls === 5 || status === 429);
      const [msg, detail] = fmtMsg(error, isNE, isSE);
      // TODO set network timeouts?????
      const retriable = isNE || isSE;
      const retryAttempt = index + 1;
      if (!retriable || maxRetryAttempts < retryAttempt) {
        console.log(retriable ? 'no more retry attempts' : 'not retriable');
        if (status !== noAlertStatus) {
          alert.push(ovrdAlert && (!ovrdAlert.code || ovrdAlert.code === code) ? 
            ovrdAlert.alert : {severity: 0, message: msg});
        }
        return throwError(() => new RequestError(detail, status));
      }
      const nextDelayMs = (1 << index) * delayMs;
      console.log(`attempt ${retryAttempt}: retrying in ${nextDelayMs} ms: ${msg}`); // WARN
      return timer(nextDelayMs);
    })
  ));

  export default retrier;