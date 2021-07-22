import { createStyles, makeStyles, TextField, Theme } from "@material-ui/core";
import { ChangeEvent, useEffect, useState } from "react";
import { NumLimit } from "../../common/limits";
import { toCap, toInt } from "../../common/validators";
import FormCtl from "../dialog/formctl";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '10ch'
    }
  })
);

type Props = {
  formCtl: FormCtl;
  limit: NumLimit;
  label?: string;
  fieldProps?: {[k: string]: any};
};

export type Validator = () => string;

const NumField = ({formCtl, limit, label, fieldProps}: Props) => {
  const classes = useStyles();
  const [isError, setIsError] = useState(false);
  useEffect(() => {
    formCtl.addField(limit.name, !limit.min);
    return () => formCtl.removeField(limit.name);
  }, [formCtl, limit]);
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    // const isValid = validNum(limit, false, v);
    const isValid = /^[0-9]+$/.test(v);
    if (v) { // non-empty: display error
      e.preventDefault();
      setIsError(!isValid);
      if (isValid) formCtl.onValueValid(limit.name, toInt(v));
      else formCtl.onValueInvalid(limit.name);
    } else { // empty: don't display if error (it's obvious to user)
      setIsError(false);
      formCtl.onValueEmpty(limit.name);
    }
  };
  const lbl = label ?? toCap(limit.name);
  let hint = limit.hint ?? '';
  return (
    <TextField label={lbl} error={isError} {...fieldProps} fullWidth
      onChange={onChange} helperText={hint} className={classes.root}
      required={true} />
  );
};

export default NumField;