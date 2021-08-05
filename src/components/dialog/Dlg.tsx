import { createStyles, Dialog, DialogTitle, makeStyles, Theme } from "@material-ui/core";
import { FormEvent, useState } from "react";
import { Observable } from "rxjs";
import FormCtl from "../dialog/formctl";
import FormActions from "./FormActions";
//.MuiFormControl-root

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiFormControl-root': {
        marginRight: '1em'
      }
    }
  })
);

export type Props = {
  open: boolean;
  onClose: () => void;
  formCtl: FormCtl,
  onSubmit: () => Observable<void>;
  children: React.ReactNode;
  title?: string;
};

const Dlg = ({open, onClose, formCtl, onSubmit, children, title}: Props) => {
  const classes = useStyles();
  const [inProg, setInProg] = useState(false);
  const onSubmitThis = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setInProg(true);
    onSubmit().subscribe({
      error: () => setInProg(false),
      complete: onClose
    });
  };
  const onCloseThis = () => {
    formCtl.clearValues();
    onClose();
  };
  // TODO focus on 1st field
  return (
    <Dialog onClose={onClose} open={open}>
      {title && <DialogTitle id={`${title.toLocaleLowerCase().replace(/\s/g, '-')}-dialog`}>{title}</DialogTitle>}
      <form noValidate onSubmit={onSubmitThis} className={classes.root}>
        { children }
        <FormActions formCtl={formCtl} onCancel={onCloseThis} disabled={inProg} />
      </form>
    </Dialog>
  );
};

export default Dlg;