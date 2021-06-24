import { ReplaySubject, Subject } from "rxjs";

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
  dec: (d: Date) => Date,
};

export const PERIODS: {[k: number]: Period} = Object.freeze({
  [PERIOD_IDS.DAY]: {
    id: PERIOD_IDS.DAY,
    label: 'Day',
    align: (d: Date) => d,
    inc: (d: Date) => {d.setDate(d.getDate() + 1); return d;},
    dec: (d: Date) => {d.setDate(d.getDate() - 1); return d;}
  },
  [PERIOD_IDS.WEEK]: {
    id: PERIOD_IDS.WEEK,
    label: 'Week',
    align: (d: Date) => {
      const dofw = d.getDay();
      if (dofw) d.setDate(d.getDate() - dofw);
      return d;},
    inc: (d: Date) => {d.setDate(d.getDate() + 7); return d;},
    dec: (d: Date) => {d.setDate(d.getDate() - 7); return d;}
  },
  [PERIOD_IDS.MONTH]: {
    id: PERIOD_IDS.MONTH,
    label: 'Month',
    align: (d: Date) => {d.setDate(1); return d;},
    inc: (d: Date) => addMonths(d, 1),
    dec: (d: Date) => addMonths(d, -1)
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

// type Range = {
//   start: Date,
//   period: number,
//   changes$: Subject<Range>
// };

// export const createRange = (date: Date, period: number): Range => {

// }

// TODO base START on 1st account 

export const rangeHasPrev = (): boolean => {
  return false;
};

export const rangePrev = () => {
  
};

export const rangeHasNext = (): boolean => {
  return false;
};

export const rangeNext = () => {
  
};
