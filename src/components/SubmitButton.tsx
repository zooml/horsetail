import { Button } from "@material-ui/core";
import { useEffect, useState } from "react";
import FormCtl from "./formctl";

type Props = {
  formCtl: FormCtl;
};

// TODO on submit via keyboard:
// https://stackoverflow.com/questions/66888248/how-do-i-programatically-show-ripple-effect-with-material-ui

const SubmitButton = ({formCtl}: Props) => {
  const [allAreValid, setAllAreValid] = useState(formCtl.allAreValid());
  useEffect(() => {
    formCtl.setOnAllAreValid(valid => setAllAreValid(valid));
    return () => formCtl.clearOnAllAreValid();
  }, [formCtl]);
  return (
    <Button disabled={!allAreValid} type="submit" color="primary" variant="contained">
      Apply
    </Button>
  );
};

export default SubmitButton;