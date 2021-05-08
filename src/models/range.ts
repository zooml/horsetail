import { ReplaySubject, Subject } from "rxjs";

export const rangePeriod = Object.freeze({
  DAY: 1,
  WEEK: 2,
  MONTH: 3,
  YEAR: 4,
  START: 5
});

const monthStart  = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

type Range = {
  start: Date,
  period: number,
  changes$: Subject<Range>
};

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

const range: Range = {
  start: monthStart(),
  period: rangePeriod.MONTH,
  changes$: new ReplaySubject<Range>(1)
};

export default range;