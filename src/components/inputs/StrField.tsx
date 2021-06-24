import { ChangeEvent, useEffect, useState } from 'react';
import { TextField } from '@material-ui/core';
import FormCtl from '../formctl';
import { StrLimit } from '../../common/limits';
import { validStr } from '../../common/validators';

type Props = {
  formCtl: FormCtl;
  fieldKey: string;
  limit: StrLimit;
  [k: string]: any;
};

const StrField = ({formCtl, fieldKey, limit, ...other}: Props) => {
  const [isError, setIsError] = useState(false);
  useEffect(() => {
    formCtl.addField(fieldKey);
    return () => formCtl.removeField(fieldKey);
  }, [formCtl, fieldKey]);
  const onChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const v = event.target.value;
    let isV = !!v;
    if (isV) { // non-empty
      isV = validStr(limit, false, v);
      setIsError(!isV);
    } else { // value is not valid but don't show error (it's obvious to user)
      setIsError(false);
    }
    formCtl.onValueChg(fieldKey, isV ? v : undefined);
  };
  return (
    <TextField margin="dense" label={limit.name} type="text"
      {...other} error={isError} required fullWidth
      onChange={onChange}
      inputProps={{maxLength: limit.max}} />
  );
};

export default StrField;