import { ChangeEvent, FormEvent, useState } from 'react';
import { Button, Dialog, Tabs, Tab } from '@material-ui/core';
import * as user from '../models/user';
import FormCtl from './formctl';
import EmailField from './inputs/EmailField';
import PswdField from './inputs/PswdField';
import { Creds } from '../api/users';
import FormActions from './FormActions';
import StrField from './inputs/StrField';
import { FIELDS } from '../common/limits';

type CredsPanelProps = {
  formCtl: FormCtl;
  showPswd?: boolean;
  isReg?: boolean;
};

const CredsPanel = ({formCtl, showPswd, isReg}: CredsPanelProps) => {
  return (
    <div>
        {/* <EmailField autoFocus formCtl={formCtl} fieldKey="email" /> */}
        <StrField fieldProps={{autoFocus: true}} formCtl={formCtl} limit={FIELDS.email} />
        { showPswd && <StrField formCtl={formCtl} limit={isReg ? FIELDS.pswd : FIELDS.signinPswd} label="Password" /> }
        {/* { showPswd && <PswdField formCtl={formCtl} fieldKey="pswd" isReg={isReg} /> } */}
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
  const onChg = (ce: ChangeEvent<{}>, v: any) => setTabIdx(v);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    switch (tabIdx) {
      // TODO disable buttons until error or complete (close)
      case 0: user.signIn(formCtl.values as Creds); break;
      // TODO case 1: user.register(formCtl.values as Creds); break;
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
        { tabIdx === 0 && <CredsPanel formCtl={formCtl} showPswd /> }
        { tabIdx === 1 && <CredsPanel formCtl={formCtl} showPswd isReg /> }
        { tabIdx === 2 && <CredsPanel formCtl={formCtl} /> }
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