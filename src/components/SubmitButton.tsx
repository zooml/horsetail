import { Button } from "@material-ui/core";
import { useState } from "react";
import FormCtl from "./formctl";

type Props = {
  formCtl: FormCtl;
};

const SubmitButton = ({formCtl}: Props) => {
  const [allAreValid, setAllAreValid] = useState(formCtl.allAreValid());
  useState(formCtl.setOnAllAreValid(valid => setAllAreValid(valid)));
  return (
    <Button disabled={!allAreValid} type="submit" color="primary" variant="contained">
      Enter
    </Button>
  );
};

export default SubmitButton;