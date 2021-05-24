import { Button, DialogActions } from "@material-ui/core";
import FormCtl from "./formctl";
import SubmitButton from "./SubmitButton";

type Props = {
  formCtl: FormCtl;
  onCancel: () => void;
};

const FormActions = ({formCtl, onCancel}: Props) => {
  return (
    <DialogActions>
      <Button color="primary" variant="text" onClick={onCancel} >Cancel</Button>
      <SubmitButton formCtl={formCtl} />
    </DialogActions>
  );
};

export default FormActions;