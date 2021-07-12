import { Button, DialogActions } from "@material-ui/core";
import FormCtl from "./formctl";
import SubmitButton from "./SubmitButton";

type Props = {
  formCtl: FormCtl;
  onCancel: () => void;
  disabled?: boolean;
};

const FormActions = ({formCtl, onCancel, disabled}: Props) => {
  return (
    <DialogActions>
      <Button color="primary" variant="text"
        onClick={onCancel} disabled={disabled} >Cancel</Button>
      <SubmitButton formCtl={formCtl} disabled={disabled} />
    </DialogActions>
  );
};

export default FormActions;