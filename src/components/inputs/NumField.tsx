import { TextField } from "@material-ui/core";
import { ChangeEvent, useEffect, useState } from "react";
import { NumLimit } from "../../common/limits";
import { toCap, validNum } from "../../common/validators";
import FormCtl from "../dialog/formctl";

type Props = {
  formCtl: FormCtl;
  limit: NumLimit;
  label?: string;
  fieldProps?: {[k: string]: any};
};

export type Validator = () => string;

const NumField = ({formCtl, limit, label, fieldProps}: Props) => {
  const [isError, setIsError] = useState(false);
  useEffect(() => {
    formCtl.addField(limit.name, !limit.min);
    return () => formCtl.removeField(limit.name);
  }, [formCtl, limit]);
  const onChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const v = event.target.value;
    const isValid = validNum(limit, false, v);
    if (v) { // non-empty: display error
      setIsError(!isValid);
    } else { // empty: don't display if error (it's obvious to user)
      setIsError(false);
    }
    formCtl.onValueChg(limit.name, isValid ? v : undefined);
  };
  const lbl = label ?? toCap(limit.name);
  let hint = limit.hint ?? '';
  return (
    <TextField label={lbl} error={isError} {...fieldProps} fullWidth
      onChange={onChange} helperText={hint}/>
  );
};

export default NumField;