const sUtcDayBegSuffix = '00:00:00.000Z';

export const today = () => {
  const d = new Date();
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
};

export const toDate = (ts: number) => {
  const sd = new Date(ts);
  return new Date(sd.getFullYear(), sd.getMonth(), sd.getDate());
};

export const fromDate = (d: Date) => {
  // translate local time to UTC with exact same y/m/d
  const m = d.getMonth();
  const a = d.getDate();
  const s = `${d.getFullYear()}-${m < 10 ? '0' + m : m}-${a < 10 ? '0' + a : a}T${sUtcDayBegSuffix}`;
  return new Date(s).getTime();
};