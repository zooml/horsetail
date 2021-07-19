import { Subject } from "rxjs";
import { Get } from '../api/base';
import { toDate } from "../utils/clndate";
import { isArr } from "../common/validators";

const chg$Name = 'chg$';

export type Chgable<TChg> = {
  chg$: Subject<TChg>;
};
export const makeChgable = <TChg>() => ({chg$: new Subject<TChg>()});
export const cmpl = <TChg>(c: Chgable<TChg> | undefined) => c?.chg$?.complete();

export type Rsc<TChg> = Chgable<TChg> & {
  id: string;
  at: Date;
  upAt: Date;
  v: number;
};
export const fromGet = <TChg>(g: Get): Rsc<TChg> => ({
  ...makeChgable(),
  id: g.id,
  at: toDate(g.at),
  upAt: toDate(g.upAt),
  v: g.v,
});

export type HashChg<T> = { // assumes key in T
  add?: T;
  rem?: T;
}
export type Idable = {id: string};
export type Hash<T> = {[k: string]: T} & Chgable<HashChg<T>>;
export const makeHash = <S, T extends Idable>(
    arr: S[] = [],
    xform: (s: S) => T = (s) => {
      return (s as unknown) as T;
    }): Hash<T> => {
  const m = {...makeChgable()} as Hash<T>;
  if (arr) {
    arr.reduce((m, s) => {
      const t = xform(s);
      m[t.id] = t;
      return m;
    }, m);
  }
  return m;
};
export const hashToArray = <T>(h: Hash<T>, cmp: (v0: T, v1: T) => number) => {
  const arr = Object.values(h).sort((v0, v1) => 
    v0 instanceof Subject
      ? 1
      : (v1 instanceof Subject
          ? -1
          : cmp(v0, v1)));
  arr.pop();
  return arr;
};
export const hashCmpl = <T>(m: Hash<T>, tCmpl?: (t: T) => void) => {
  if (tCmpl) {
    for (const [k, v] of Object.entries(m)) {
      if (k !== chg$Name) tCmpl(v);
    }
  }
  cmpl(m);
};

export type ArrChg<T> = {
  add?: [number, T];
  rem?: [number, T];
  reord?: boolean;
};
export type Arr<T> = Array<T> & Chgable<ArrChg<T>>;
export const makeArr = <S, T>(items: S[], f: (s: S) => T): Arr<T> => {
  const arr = items.map(f);
  (arr as Arr<T>).chg$ = new Subject<ArrChg<T>>();
  return arr as Arr<T>;
};
export const copyArr = <T>(arr: Arr<T>): Arr<T> => {
  const a = [...arr] as Arr<T>;
  a.chg$ = arr.chg$;
  return a;
};
export const arrCmpl = <T>(m: Arr<T>, tCmpl?: (t: T) => void) => {
  if (tCmpl) m.forEach(tCmpl);
  cmpl(m);
}

export function addToMdl<T>(m: Hash<T>, itm: any, k: string): void;
export function addToMdl<T>(m: Arr<T>, itm: any, i: number): void; // -1 for end
export function addToMdl<T>(m: Hash<T> | Arr<T>, itm: any, k: string | number): void {
  if (isArr(m)) {
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
  if (isArr(m)) {
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
