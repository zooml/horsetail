import React, { ChangeEvent } from 'react';
import { TextField } from '@material-ui/core';
import { FieldOnValueChg } from './formctl';

type Props = {
  autoFocus?: boolean;
  onValueChg?: FieldOnValueChg;
};

const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;

const validate = (s: string) => emailRegex.test(s);

const EmailField = ({autoFocus, onValueChg}: Props) => {
  const [valid, setValid] = React.useState(false);
  const onChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const value = event.target.value;
    const v = validate(value);
    setValid(v);
    if (onValueChg) onValueChg(v ? value : undefined);
  };
  return (
    <TextField margin="dense" id="email" label="Email" type="text"
      autoFocus={autoFocus} error={!valid} required fullWidth
      onChange={onChange}
      inputProps={{autoComplete: 'new-email'}} />
  );
};

export default EmailField;