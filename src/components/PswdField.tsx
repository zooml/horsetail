import React, { ChangeEvent } from 'react';
import { TextField } from '@material-ui/core';
import { FieldOnValueChg } from './formctl';

type Props = {
  help?: boolean;
  onValueChg?: FieldOnValueChg;
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

const PswdField = ({help, onValueChg, ...other}: Props) => {
  const [valid, setValid] = React.useState(false);
  const onChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const value = event.target.value;
    const v = validate(value);
    setValid(v);
    if (onValueChg) onValueChg(v ? value : undefined);
  };
  return (
    <TextField margin="dense" id="pswd" label="Password" type="password"
      {...other} error={!valid} required fullWidth 
      onChange={onChange}
      helperText={help ? helperText : ''} />
  );
};

export default PswdField;