import { ReplaySubject, Subject, Subscription } from "rxjs";

export const ackError = (msg: string): Subject<void> => {
  const e$ = new Subject<void>();
  e$.error(new Error(msg));
  return e$;
}

export const checkPostState = <T>(allState: GlbState<T>, postAck$: Subject<void> | undefined) => {
  if (allState.ack$) return ackError(`${allState.name}: invalid state, must get all first`);
  if (postAck$) return ackError(`${allState.name}: invalid state, previous post still in progress`);
};

export default class GlbState<T> {
  readonly name: string;
  readonly mdl$ = new ReplaySubject<T>();
  first: boolean;
  mdl?: T;
  ack$?: Subject<void>;
  subscpt?: Subscription;
  constructor(nameOrPrev: string | GlbState<T>) {
    if (typeof nameOrPrev === 'string') {
      this.name = nameOrPrev;
      this.first = true;
    } else {
      this.name = nameOrPrev.name;
      this.first = false;
    }
  }
  unsubscribe() {
    this.subscpt?.unsubscribe();
    this.subscpt = undefined;
  }
  next(mdl: T) {
    this.unsubscribe();
    this.first = false;
    this.mdl = mdl;
    const tmp$ = this.ack$;
    delete this.ack$;
    console.log(`${this.name} state: next`);
    tmp$?.complete();
    this.mdl$.next(mdl);  
  }
  error(e: Error) { // keep mdl$, report error via ack$, allow retry
    this.unsubscribe();
    this.first = false;
    const tmp$ = this.ack$;
    delete this.ack$;
    console.log(`${this.name} state: error: ${e.message}`);
    tmp$?.error(e);  
  }
  cmpl(cmplMdl: (m: T) => void) { // assumes this state already replaced
    this.unsubscribe();
    this.first = false;
    if (this.ack$) {
      const msg = 'user signed out while waiting for load, or invalid session';
      console.log(`${this.name} state: ${msg}`);
      this.ack$?.error(new Error(msg));
    }
    if (this.mdl) cmplMdl(this.mdl);
    console.log(`${this.name} state: complete`);
    this.mdl$.complete();
  }
};
