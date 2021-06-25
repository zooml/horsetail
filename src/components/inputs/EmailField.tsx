import { ChangeEvent, useEffect, useState } from 'react';
import { TextField } from '@material-ui/core';
import FormCtl from '../formctl';
import { FIELDS } from '../../common/limits';

type Props = {
  formCtl: FormCtl;
  fieldKey: string;
  [k: string]: any;
};

const validate = (s: string) => FIELDS.email.regex?.test(s) ?? false; // regex always defined

const EmailField = ({formCtl, fieldKey, ...other}: Props) => {
  const [isError, setIsError] = useState(false);
  useEffect(() => {
    formCtl.addField(fieldKey);
    return () => formCtl.removeField(fieldKey);
  }, [formCtl, fieldKey]);
  const onChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const v = event.target.value;
    let isV = !!v;
    if (isV) { // non-empty
      isV = validate(v);
      setIsError(!isV);
    } else { // value is not valid but don't show error (it's obvious to user)
      setIsError(false);
    }
    formCtl.onValueChg(fieldKey, isV ? v : undefined);
  };
  return (
    <TextField margin="dense" label="Email" type="text"
      // autoComplete="new-email"
      {...other} error={isError} required fullWidth
      onChange={onChange}
      inputProps={{autoComplete: 'new-email', maxLength: FIELDS.email.max}} />
  );
};

export default EmailField;