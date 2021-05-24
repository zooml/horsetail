import { ChangeEvent, useEffect, useState } from 'react';
import { TextField } from '@material-ui/core';
import FormCtl, { FieldOnValueChg } from './formctl';

type Props = {
  formCtl: FormCtl;
  fieldKey: string;
  isReg?: boolean;
  [key: string]: any;
};

const helperText = "at least: 1 a-z, 1 A-Z, 1 digit, 1 special, 8 chars";

const validate = (s: string) => {
  return 8 <= s.length
    && /[a-z]/.test(s)
    && /[A-Z]/.test(s)
    && /[0-9]/.test(s)
    && /[^a-zA-Z0-9]/.test(s);
}

type Ons = {valueChg?: FieldOnValueChg};

const PswdField = ({formCtl, fieldKey, isReg, ...other}: Props) => {
  const [isError, setIsError] = useState(false);
  const [ons,] = useState({} as Ons);
  useEffect(() => {
    ons.valueChg = formCtl.addField(fieldKey);
    return () => formCtl.removeField(fieldKey);
  } , [ons, formCtl, fieldKey]);
  const onChg = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const v = event.target.value;
    let isV;
    if (isReg) { // if registration then full validate
      isV = validate(v);
      setIsError(!isV);
    } else { // never show error
      isV = !!v;
    }
    if (ons.valueChg) ons.valueChg(isV ? v : undefined);
  };
  return (
    <TextField margin="dense" id="pswd" label="Password" type="password"
      {...other} error={isError} required fullWidth 
      onChange={onChg}
      helperText={isReg ? helperText : ''} />
  );
};

export default PswdField;