import { Button } from "@material-ui/core";
import { useEffect, useState } from "react";
import FormCtl from "./formctl";

type Props = {
  formCtl: FormCtl;
  disabled?: boolean;
};

// TODO on submit via keyboard:
// https://stackoverflow.com/questions/66888248/how-do-i-programatically-show-ripple-effect-with-material-ui

const SubmitButton = ({formCtl, disabled}: Props) => {
  const [allAreValid, setAllValid] = useState(formCtl.areAllValid());
  useEffect(() => {
    formCtl.setOnAllValid(valid => setAllValid(valid));
    return () => formCtl.clearOnAllValid();
  }, [formCtl]);
  return (
    <Button disabled={disabled || !allAreValid} type="submit" color="primary" variant="contained">
      Apply
    </Button>
  );
};

export default SubmitButton;