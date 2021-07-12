import { ChangeEvent, useEffect, useState } from 'react';
import { TextField } from '@material-ui/core';
import FormCtl from '../dialog/formctl';
import { FIELDS, StrLimit } from '../../common/limits';
import { toCap, validStr } from '../../common/validators';

type Props = {
  formCtl: FormCtl;
  limit: StrLimit;
  label?: string;
  noHint?: boolean;
  fieldProps?: {[k: string]: any};
};

const StrField = ({formCtl, limit, label, noHint, fieldProps}: Props) => {
  const [isError, setIsError] = useState(false);
  useEffect(() => {
    formCtl.addField(limit.name, !limit.min);
    return () => formCtl.removeField(limit.name);
  }, [formCtl, limit.name, limit.min]);
  const onChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const v = event.target.value;
    const isValid = validStr(limit, false, v);
    if (v) { // non-empty: display error
      setIsError(!isValid);
    } else { // empty: don't display if error (it's obvious to user)
      setIsError(false);
    }
    formCtl.onValueChg(limit.name, isValid ? v : undefined);
  };
  const inputProps: {[k: string]: any} = {
    maxLength: limit.max
  };
  let type = 'text';
  const misc: {[k: string]: any} = {};
  let hint = noHint ? '' : limit.hint ?? '';
  if (limit === FIELDS.email) {
    inputProps.autoComplete = 'new-email';
    misc.autoComplete = 'new-email';
  } else if (limit.name === 'pswd') { // register and sign in
    type = 'password';
    misc.autoComplete = 'new-password';
    label = 'Password';
  }
  if (limit.min) misc.required = true;
  const lbl = label ?? toCap(limit.name);
  return (
    <TextField margin="dense" label={lbl} type={type} error={isError} fullWidth
      {...fieldProps} {...misc}
      onChange={onChange}
      inputProps={inputProps} helperText={hint} />
  );
};

export default StrField;