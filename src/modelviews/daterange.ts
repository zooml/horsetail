import { ReplaySubject, Subject } from "rxjs";
import * as org from '../models/org';
import * as base from '../models/mdl';

export const PERIOD_IDS = Object.freeze({
  DAY: 0,
  WEEK: 1,
  MONTH: 2,
  YEAR: 3,
  BEG: 4
});

export type Period = {
  id: number;
  label: string;
  align: (d: Date) => Date; // return beg that includes date
  inc: (d: Date) => Date; // always need to compute in case of leap seconds
  dec: (d: Date) => Date;
  isBeg: (d: Date) => boolean; // period start days
};

export const PERIODS: {[k: number]: Period} = Object.freeze({
  [PERIOD_IDS.DAY]: {
    id: PERIOD_IDS.DAY,
    label: 'Day',
    align: (d: Date) => d,
    inc: (d: Date) => {d.setDate(d.getDate() + 1); return d;},
    dec: (d: Date) => {d.setDate(d.getDate() - 1); return d;},
    isBeg: (_d: Date) => true
  },
  [PERIOD_IDS.WEEK]: {
    id: PERIOD_IDS.WEEK,
    label: 'Week',
    align: (d: Date) => {
      const dofw = d.getDay();
      if (dofw) d.setDate(d.getDate() - dofw);
      return d;},
    inc: (d: Date) => {d.setDate(d.getDate() + 7); return d;},
    dec: (d: Date) => {d.setDate(d.getDate() - 7); return d;},
    isBeg: (d: Date) => d.getDay() === 0
  },
  [PERIOD_IDS.MONTH]: {
    id: PERIOD_IDS.MONTH,
    label: 'Month',
    align: (d: Date) => {d.setDate(1); return d;},
    inc: (d: Date) => addMonths(d, 1),
    dec: (d: Date) => addMonths(d, -1),
    isBeg: (d: Date) => d.getDate() === 1
  },

  // TODO year, beg
});

export const PERIOD_LABELS: string[] = Object.values(PERIODS)
  .sort((p0, p1) => p0.id - p1.id)
  .reduce((a, p) => {a.push(p.label); return a;}, [] as string[]);

export const todayBeg = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const addMonths = (date: Date, months: number) => {
  // https://stackoverflow.com/questions/2706125/javascript-function-to-add-x-months-to-a-date
  var dofm = date.getDate();
  date.setMonth(date.getMonth() + months);
  if (date.getDate() !== dofm) {
    date.setDate(0);
  }
  return date;
}

export type Chg = {
  period?: Period;
  beg?: Date;
  end?: Date;
  hasPrev?: boolean;
};

export type Mdl = base.Chgable<Chg> & {
  period: Period;
  beg: Date;
  end: Date;
  hasPrev: boolean;
};

export class MdlCls {
  lBnd: Date;
  period: Period;
  beg: Date;
  end: Date;
  hasPrev: boolean;
  lBndPeriodBeg: Date | undefined;
  chg$: Subject<Chg>;
  constructor(lBnd: Date) {
    this.lBnd = lBnd;
    this.period = PERIODS[PERIOD_IDS.MONTH];
    const today = todayBeg();
    this.beg = this.period.align(today < this.lBnd ? this.lBnd : today);
    this.end = this.period.inc(this.beg);
    this.hasPrev = this.lBnd < this.beg;
    this.chg$ = new Subject();
  }
  private postChg(b?: Date, e?: Date, c?: Chg) {
    let chged = !!c;
    const chg = c ?? {};
    if (b) {chg.beg = b; this.beg = b; chged = true;}
    if (e) {chg.end = e; this.end = e; chged = true;}
    const hasPrev = this.lBnd < this.beg;
    if (hasPrev !== this.hasPrev) {
      this.hasPrev = hasPrev;
      chg.hasPrev = hasPrev;
      chged = true;
    }
    if (chged) this.chg$.next(chg);
  }
  next() { // TODO uBnd as last txndoc date????
    this.postChg(this.end, this.period.inc(this.beg));
  }
  prev() {
    if (!this.hasPrev) {console.log('daterange: date range has no prev'); return;}
    this.postChg(this.period.dec(this.end), this.beg);
  }
  setLBnd(d: Date) {
    if (this.lBnd.getTime() === d.getTime()) return;
    this.lBndPeriodBeg = undefined;
    const old = this.lBnd;
    this.lBnd = d;
    if (this.lBnd < old) { // new < old, moved to earlier: only need to check hasPrev if none
      if (!this.hasPrev) this.postChg();
    } else { // old < new, moved to later: compare w/ beg
      if (this.lBnd < this.beg) {
        // lBnd < beg, still prior to beg: no change
      } else if (this.lBnd.getTime() === this.beg.getTime()) {
        // lBnd == beg, moved to same as beg: should go from has prev to no prev
        this.postChg();
      } else { // beg < lBdn: old may have been before, same, or after
        this.lBndPeriodBeg = this.period.align(this.lBnd);
        if (this.beg < this.lBndPeriodBeg) { // beg way before: move beg/end
          const e = this.period.inc(this.lBndPeriodBeg);
          this.postChg(this.lBndPeriodBeg, e);
        } else { // lBndBeg <= beg: beg still good, just check if no longer has prev
          if (this.hasPrev) this.postChg();
        }
      }
    }
  }
  setPeriod(p: Period) {
    if (p === this.period) return;
    this.period = p;
    this.lBndPeriodBeg = undefined;
    const c: Chg = {
      period: p
    };
    let b: Date | undefined = p.align(this.beg);
    if (b.getTime() === this.beg.getTime()) b = undefined;
    let e : Date | undefined = this.period.inc(b ?? this.beg);
    if (e.getTime() === this.end.getTime()) e = undefined;
    this.postChg(b, e, c);
  }
  setBeg(d: Date) {
    if (this.beg.getTime() === d.getTime()) return;
    if (!this.isPeriodBeg(d)) {console.log('daterange: setBeg call invalid, not period beg'); return;}
    this.postChg(d, this.period.inc(d));
  }
  isPeriodBeg(d: Date) {
    if (!this.period.isBeg(d)) return false;
    if (this.lBnd.getTime() <= d.getTime()) return true;
    if (!this.lBndPeriodBeg) { // cache the 1 that is prior to lBnd
      this.lBndPeriodBeg = this.period.align(this.lBnd);
    }
    return this.lBndPeriodBeg.getTime() === d.getTime();
  }
};

let mdl: MdlCls | undefined;
let mdl$ = new ReplaySubject<Mdl>(1);
let waiting = false;

// returns a stream with the current or future date range
// completes when org cleared, must call here again to get next stream
export const get$ = (): ReplaySubject<Mdl> => {
  if (!mdl && !waiting) {
    org.get$().subscribe({
      next: org => {
        waiting = false;
        mdl = new MdlCls(org.begAt);
        org.chg$.subscribe({
          next: chg => {
            if (chg.begAt) mdl?.setLBnd(chg.begAt);
          }
        })
        mdl$.next(mdl);
      },
      complete: () => {
        waiting = false;
        const tmp = mdl;
        mdl = undefined;
        const tmp$ = mdl$;
        mdl$ = new ReplaySubject(1);
        if (tmp) base.cmpl(tmp);
        tmp$.complete();
      }
    });
  }
  return mdl$;
}

export const next = () => {
  if (!mdl) {console.log('daterange: next call invalid, no mdl'); return;}
  mdl.next();
};

export const prev = () => {
  if (!mdl) {console.log('daterange: prev call invalid, no mdl'); return;}
  mdl.prev();
};

export const setPeriodByLabel = (label: string) => {
  if (!mdl) {console.log('daterange: setPeriod call invalid, no mdl'); return;}
  const p = Object.values(PERIODS).find(i => i.label === label);
  if (!p) {console.log('daterange: setPeriod call invalid, label not found'); return;}
  mdl.setPeriod(p);
};

export const setBeg = (d: Date) => {
  if (!mdl) {console.log('daterange: setBeg call invalid, no mdl'); return;}
  mdl.setBeg(d);
}

export const isPeriodBeg = (d: Date) => {
  if (!mdl) {console.log('daterange: isPeriodBeg call invalid, no mdl'); return;}
  return mdl.isPeriodBeg(d);
}