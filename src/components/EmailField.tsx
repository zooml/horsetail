import React, { ChangeEvent, useEffect, useState } from 'react';
import { TextField } from '@material-ui/core';
import FormCtl, { FieldOnValueChg } from './formctl';

type Props = {
  formCtl: FormCtl;
  fieldKey: string;
  [key: string]: any;
};

const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/;

const validate = (s: string) => emailRegex.test(s);

type Ons = {valueChg?: FieldOnValueChg};

const EmailField = ({formCtl, fieldKey, ...other}: Props) => {
  const [isError, setIsError] = useState(false);
  const [ons,] = useState({} as Ons);
  useEffect(() => {
    ons.valueChg = formCtl.addField(fieldKey);
    return () => formCtl.removeField(fieldKey);
  } , [ons, formCtl, fieldKey]);
  const onChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const v = event.target.value;
    let isV = !!v;
    if (isV) { // non-empty
      isV = validate(v);
      setIsError(!isV);
    } else { // value is not valid but don't show error (it's obvious to user)
      setIsError(false);
    }
    if (ons.valueChg) ons.valueChg(isV ? v : undefined);
  };
  return (
    <TextField margin="dense" id="fieldxxxx" label="Email" type="text"
      {...other} error={isError} required fullWidth
      onChange={onChange}
      inputProps={{autoComplete: 'new-email'}} />
  );
};

export default EmailField;