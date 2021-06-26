import { ChangeEvent, FormEvent, useState } from 'react';
import { Button, Dialog, Tabs, Tab } from '@material-ui/core';
import * as user from '../models/user';
import * as users from '../api/users';
import * as sessions from '../api/sessions';
import FormCtl from './formctl';
import StrField from './inputs/StrField';
import { FIELDS } from '../common/limits';
import FormActions from './FormActions';

type PanelProps = {
  formCtl: FormCtl;
  mode: number; // 0 - signin, 1 - register, 2 - reset pswd
};

const Panel = ({formCtl, mode}: PanelProps) => {
  return (
    <div>
        <StrField fieldProps={{autoFocus: true}} formCtl={formCtl} limit={FIELDS.email} />
        { mode <= 1 && <StrField
          formCtl={formCtl} limit={mode === 0 ? FIELDS.signinPswd : FIELDS.pswd}
          label="Password" noHint={mode === 0} /> }
        { mode === 1 && <StrField formCtl={formCtl} limit={FIELDS.fName} label="First name" /> }
        { mode === 1 && <StrField formCtl={formCtl} limit={FIELDS.lName} label="Last name" /> }
    </div>
  );
};

type UserCtlDialogProps = {
  open: boolean;
  onClose: () => void;
}

const UserCtlDialog = ({open, onClose}: UserCtlDialogProps) => {
  const [tabIdx, setTabIdx] = useState(0);
  const [formCtl,] = useState(new FormCtl());
  const onChg = (ce: ChangeEvent<{}>, v: any) => {
    setTabIdx(v);
    // setFormCtl(new FormCtl());
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    switch (tabIdx) {
      // TODO disable buttons until error or complete (close)
      case 0: user.signIn(formCtl.values as sessions.Post); break;
      case 1: user.register(formCtl.values as users.Post); break;
      case 2: break; // TODO
    }
  }
  // TODO theme primary color Tabs TabIndicatorProps={{ style: { background: "#hex-color" } }}
  return (
    <Dialog onClose={onClose} open={open}>
      <Tabs value={tabIdx} onChange={onChg} aria-label="simple tabs example"
        TabIndicatorProps={{ style: { background: "#000088" } }}>
        <Tab label="Sign in" />
        <Tab label="Register" />
        <Tab label="Reset password" />
      </Tabs>
      <form noValidate onSubmit={onSubmit}>
        <Panel key={tabIdx} formCtl={formCtl} mode={tabIdx} />
        <FormActions formCtl={formCtl} onCancel={onClose} />
      </form>
    </Dialog>
  );
}

export type Props = {
  [k: string]: any
};

const UserCtlButton = (props: Props) => {
  const [open, setOpen] = useState(false);
  const onClose = () => setOpen(false);
  return (
    <div {...props}>
      <Button color="inherit" disabled={open} onClick={() => setOpen(true)} variant="outlined" >
        Sign In
      </Button>
      <UserCtlDialog open={open} onClose={onClose}/>
    </div> 
  );
};

export default UserCtlButton;