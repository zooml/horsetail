import { MenuItem } from "@material-ui/core";
import { TextField } from "@material-ui/core";
import { ChangeEvent, useEffect, useState } from "react";
import { ChoiceLimit } from "../../common/limits";
import { toCap, toInt } from "../../common/validators";
import FormCtl from "../dialog/formctl";

type Choice = [number, string];

export type ChDis = {
  [k: number]: boolean;
};

type Props = {
  formCtl: FormCtl;
  limit: ChoiceLimit;
  value?: number;
  rdo?: boolean;
  chDis?: ChDis;
  label?: string;
};

const genChoices = (limit: ChoiceLimit) =>
  Object.entries(limit.choices).map(vl => [toInt(vl[0]), vl[1]] as Choice).sort((vl0, vl1) => vl0[0] - vl1[0]);

const SelField = ({formCtl, limit, value, rdo, chDis, label}: Props) => {
  const [choices,] = useState(genChoices(limit));
  const [val, setVal] = useState<number | undefined>(value);
  useEffect(() => {
    if (rdo) return;
    formCtl.addField(limit.name, false);
    return () => formCtl.removeField(limit.name);
  }, [rdo, formCtl, limit]);
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = toInt(e.target.value);
    setVal(v);
    formCtl.onValueValid(limit.name, v);
  };
  return (
    <TextField select label={label ?? toCap(limit.name)}
      value={val} onChange={onChange} required={!rdo}
      disabled={rdo} helperText={rdo ? '' : limit.hint}>
      {choices.map(ch =>
        <MenuItem key={ch[0]} value={ch[0]}
          disabled={chDis ? chDis[ch[0]] ?? false : false}>
          {ch[1]}
        </MenuItem>)}
    </TextField>
  );
};

export default SelField;