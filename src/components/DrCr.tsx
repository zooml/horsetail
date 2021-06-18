import { Typography } from '@material-ui/core';

type IfDrCrProps = {
  amount: number,
  asCr: boolean,
  asSum?: boolean,
  style?: {[k: string]: any},
  [k: string]: any
}

const countryLocaleCode = 'en-US'; // TODO localize
const currencyCode = 'USD';
const currencyNumFmt = {
  style: 'currency',
  currency: currencyCode,
  currencyDisplay: 'code'
};

export default function DrCr({amount, asCr, asSum, style, ...other}: IfDrCrProps) {
  let n = asCr ? -amount : amount;
  // const neg = n < 0; TODO if using '()' need to align digits between neg and non-neg values
  // if (neg) n = -n;
  // trick for not displaying currency symbol
  let s = new Intl.NumberFormat(countryLocaleCode, currencyNumFmt).format(n);
  s = s.replace(/[a-z]{3}/i, '').trim();
  // if (neg) s = `(${s})`
  style = style || {};
  style.textAlign = 'right';
  if (asSum) {
    style.textDecoration = 'underline';
  }
  return (<Typography {...other} style={style}>{s}</Typography>);
}