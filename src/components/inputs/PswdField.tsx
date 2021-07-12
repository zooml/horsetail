import { ChangeEvent, useEffect, useState } from 'react';
import { TextField } from '@material-ui/core';
import FormCtl from '../dialog/formctl';

type Props = {
  formCtl: FormCtl;
  fieldKey: string;
  isReg?: boolean;
  [k: string]: any;
};

const helperText = "at least: 1 a-z, 1 A-Z, 1 digit, 1 special, 8 chars";

const validate = (s: string) => {
  return 8 <= s.length
    && /[a-z]/.test(s)
    && /[A-Z]/.test(s)
    && /[0-9]/.test(s)
    && /[^a-zA-Z0-9]/.test(s);
}

const PswdField = ({formCtl, fieldKey, isReg, ...other}: Props) => {
  const [isError, setIsError] = useState(false);
  useEffect(() => {
    formCtl.addField(fieldKey);
    return () => formCtl.removeField(fieldKey);
  } , [formCtl, fieldKey]);
  const onChg = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const v = event.target.value;
    let isV = !!v; // default for not isReg (never show error)
    if (isReg) { // if registration then full validate
      isV = validate(v);
      setIsError(!isV);
    }
    formCtl.onValueChg(fieldKey, isV ? v : undefined);
  };
  return (
    <TextField margin="dense" label="Password" type="password"
      {...other} error={isError} required fullWidth 
      autoComplete="new-password"
      onChange={onChg}
      helperText={isReg ? helperText : ''} />
  );
};

export default PswdField;