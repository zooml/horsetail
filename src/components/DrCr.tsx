import { Typography } from '@material-ui/core';

type Props = {
  amt: number,
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

export default function DrCr({amt, asCr, asSum, style, ...other}: Props) {
  let n = asCr ? -amt : amt;
  const isNeg = n < 0;
  if (n < 0) n = -n;
  // trick for not displaying currency symbol
  let s = new Intl.NumberFormat(countryLocaleCode, currencyNumFmt).format(n);
  s = s.replace(/[a-z]{3}/i, '').trim();
  style = style ?? {};
  style.textAlign = 'right';
  style.display = 'inline';
  const parenStyle = {...style};
  if (asSum) {
    style.textDecoration = 'underline';
  }
  parenStyle.visibility = isNeg ? "visible" : "hidden";
  return (
    <div style={{display: 'inline'}}>
      <Typography {...other} style={parenStyle}>(</Typography>
      <Typography {...other} style={style}>{s}</Typography>
      <Typography {...other} style={parenStyle}>)</Typography>
    </div>
  );
}