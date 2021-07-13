import { Dialog } from "@material-ui/core";
import { FormEvent, useState } from "react";
import { Subject } from "rxjs";
import FormCtl from "../dialog/formctl";
import FormActions from "./FormActions";

export type Props = {
  open: boolean;
  onClose: () => void;
  formCtl: FormCtl,
  onSubmit: () => Subject<void>;
  children: React.ReactNode;
};

const Dlg = ({open, onClose, formCtl, onSubmit, children}: Props) => {
  const [inProg, setInProg] = useState(false);
  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    setInProg(true);
    onSubmit().subscribe({
      error: () => setInProg(false),
      complete: onClose
    });
  };
  // TODO focus on 1st field
  return (
    <Dialog onClose={onClose} open={open}>
      <form noValidate onSubmit={onFormSubmit}>
        { children }
        <FormActions formCtl={formCtl} onCancel={onClose} disabled={inProg} />
      </form>
    </Dialog>
  );
};

export default Dlg;