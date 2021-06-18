import { Subject } from "rxjs";
import { Get } from '../api/base';
import { toDate } from "../common/acctdate";

export type Chgable<TChg> = {
  chg$: Subject<TChg>;
};

export const cmpl = <TChg>(c: Chgable<TChg> | undefined) => c?.chg$?.complete();

export type Rsc<TChg> = Chgable<TChg> & {
  id: string;
  at: Date;
  upAt: Date;
  v: number;
};

export const fromGet = <TChg>(g: Get): Rsc<TChg> => ({
  id: g.id,
  at: toDate(g.at),
  upAt: toDate(g.upAt),
  v: g.v,
  chg$: new Subject<TChg>()
});

export type HashChg<T> = { // assumes key in T
  add?: T;
  rem?: T;
}

export type Hash<T> = {[k: string]: T} & Chgable<HashChg<T>>;

export type ArrChg<T> = {
  add?: [number, T];
  rem?: [number, T];
};

export type Arr<T> = Array<T> & Chgable<ArrChg<T>>;

export const makeArr = <S, T>(items: S[], f: (s: S) => T): Arr<T> => {
  const arr = items.map(f);
  (arr as Arr<T>).chg$ = new Subject<ArrChg<T>>();
  return arr as Arr<T>;
};

export function addToMdl<T>(m: Hash<T>, itm: any, k: string): void;
export function addToMdl<T>(m: Arr<T>, itm: any, i: number): void; // -1 for end
export function addToMdl<T>(m: Hash<T> | Arr<T>, itm: any, k: string | number): void {
  if (Array.isArray(m)) {
    const a = m as Arr<T>;
    let i = k as number;
    if (i < 0) {i = a.length; a.push(itm);}
    else a.splice(i, 0, itm);
    a.chg$.next({add: [i, itm]});
  } else {
    const o = m as Hash<T>;
    const key = k as string;
    o[key] = itm;
    o.chg$.next({add: itm});
  }
};

export function remFromMdl<T>(m: Hash<T>, k: string): void;
export function remFromMdl<T>(m: Arr<T>, i: number): void;
export function remFromMdl<T>(m: Hash<T>| Arr<T>, k: string | number): void {
  if (Array.isArray(m)) {
    const a = m as Arr<T>;
    const i = k as number;
    const t = a.splice(i, 1)[0];
    a.chg$.next({rem: [i, t]})
  } else {
    const o = m as Hash<T>;
    const key = k as string;
    const itm = o[key];
    delete o[key];
    o.chg$.next({rem: itm});
  }
};

// export class ArrMdl<T> extends Array<T> implements Chgable<ArrChg<T>> {
//   chg$: Subject<ArrChg<T>> = new Subject();
//   private constructor(items?: Array<T>) {
//     super(items ? items.length : 0);
//     if (items) items.forEach(i => this.push(i));
//   }
//   static create<T>(): ArrMdl<T> {
//       return Object.create(ArrMdl.prototype);
//   };
//   addMdl(i: number, m: T) {
//     if (i < 0) this.push(m);
//     else this.splice(i, 0, m);
//     this.chg$.next({add: [i, m]});
//   }
//   remMdl(i: number) {
//     this.splice(i, 1);
//     this.chg$.next({rem: i});
//   }
//   complete() {this.chg$.complete();}
// }
