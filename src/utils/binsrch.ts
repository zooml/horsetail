export type Cmp<T> = (t0: T, t1: T) => number;

const binsrch = <T>(arr: T[], t: T, cmp: Cmp<T>): number => {
  let m = 0;
  let n = arr.length;
  if (n === 0) return 0;
  while (true) {
    const mid = Math.floor((n - m) / 2) + m; // mid==m if 1 left, m+1/n-1 if 2 left
    const c = cmp(t, arr[mid]); // <0 if t<arr, 0 if t==arr, >0 if t>arr
    if (c < 0) {
      if (mid === m) return m;
      n = mid;
    } else if (c === 0) { // note this does not do stable sort
      return mid;
    } else {
      if (mid === m) return m + 1;
      if (mid === n - 1) return n;
      m = mid + 1;
    }
  }
};

export default binsrch;