import { Subject } from "rxjs";

export type BaseSvc = {
  at: Date,
  upAt: Date,
  v: number
};

export type BaseMdl<TChg> = {
  chg$: Subject<TChg>
}

export type AllChg<T> = {
  op: string,
  value: T
};

export type All<T> = {
  [key: string]: T
} & {
  chg$: Subject<AllChg<T>>
};