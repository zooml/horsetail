import { EMPTY, Observable, throwError, timer } from 'rxjs';
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

const fmtMsg = (e: AjaxError, isNE?: boolean): string => {
  if (isNE) {
    return msgs.NETWORK_ERROR;
  }
  const body = e.response?.body;
  const code = body?.code;
  if (!code) {
    return msgs.UNKNOWN_ERROR + ` (${e.status})`;
  }
  // name.charAt(0).toUpperCase() + name.slice(1)
  let msg = body?.message ?? '.'; // should always be message if code
  msg = `${msg.charAt(0).toUpperCase()}${msg.slice(1)}`;
  if (msg.charAt(msg.length - 1) !== '.') msg = `${msg}.`;
  return msgs.UNEXPECTED_ERROR + `${msg} (${code})`;
};

// https://gist.github.com/tanem/011a950b93a89e43cfc335f617dbb230
// TODO what about network errors???? AjaxTimeout????? status === 0 timeout?
// https://www.aurigait.com/blog/error-handling-in-ajax/
// bad domain: {"message":"ajax error","name":"AjaxError","xhr":{},"request":{"async":true,"crossDomain":true,"withCredentials":false,"method":"GET","timeout":0,"responseType":"json","url":"http://asdfasdfadf.com","headers":{"x-requested-with":"XMLHttpRequest"}},"status":0,"responseType":"json","response":null}
//    "message":"ajax error","status":0,"response":null
const retrier = <T>({
  maxRetryAttempts = 3,
  delayMs = 1000,
  throwOnError = false
} = {}) => retryWhen<T>((errors: Observable<AjaxError>) =>
  errors.pipe(
    mergeMap((error, index) => {
      const status = error.status;
      const errorCls = Math.floor(status / 100);
      const isNE = isNetworkError(error);
      // TODO param for "action desc" for more useful msg
      const msg = fmtMsg(error, isNE);
      // TODO if timeout then retry????? set timeouts?????
      const retriable =
          isNE ||
          errorCls === 5 ||
          status === 429;
      const retryAttempt = index + 1;
      if (!retriable || maxRetryAttempts < retryAttempt) {
        if (throwOnError) {
          return throwError(() => new RequestError(msg, status));
        }
        alert.push({severity: 0, message: msg});
        return EMPTY;
      }
      const nextDelayMs = (1 << index) * delayMs;
      console.log(`attempt ${retryAttempt}: retrying in ${nextDelayMs} ms: ${msg}`); // WARN
      return timer(nextDelayMs);
    })
  ));

  export default retrier;