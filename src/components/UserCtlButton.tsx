import { ChangeEvent, FormEvent, useState } from 'react';
import { Button, Dialog, Tabs, Tab } from '@material-ui/core';
import * as user from '../models/user';
import FormCtl from './formctl';
import EmailField from './inputs/EmailField';
import PswdField from './inputs/PswdField';
import { Creds } from '../models/user';
import FormActions from './FormActions';

type CredsPanelProps = {
  formCtl: FormCtl;
  showPswd?: boolean;
  isReg?: boolean;
};

const CredsPanel = ({formCtl, showPswd, isReg}: CredsPanelProps) => {
  return (
    <div>
        <EmailField autoFocus formCtl={formCtl} fieldKey="email" />
        { showPswd && <PswdField formCtl={formCtl} fieldKey="pswd" isReg={isReg} /> }
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
      case 0: user.signIn(formCtl.values as Creds); break;
      // case 1: user.register(formCtl.values as Creds); break;
      case 2: break; // TODO
    }
  }
  // TODO theme primary color Tabs TabIndicatorProps={{ style: { background: "#hex-color" } }}
  return (
    <Dialog onClose={onClose} open={open}>
      <Tabs value={tabIdx} onChange={onChg} aria-label="simple tabs example"
        TabIndicatorProps={{ style: { background: "#000088" } }}>
        <Tab label="Sign In" />
        <Tab label="Register" />
        <Tab label="Reset Password" />
      </Tabs>
      <form noValidate onSubmit={onSubmit} >
        { tabIdx === 0 && <CredsPanel formCtl={formCtl} showPswd /> }
        { tabIdx === 1 && <CredsPanel formCtl={formCtl} showPswd isReg /> }
        { tabIdx === 2 && <CredsPanel formCtl={formCtl} /> }
        <FormActions formCtl={formCtl} onCancel={onClose} />
      </form>
    </Dialog>
  );
}

const UserCtlButton = () => {
  const [open, setOpen] = useState(false);
  const onClose = () => setOpen(false);
  return (
    <div>
      <Button disabled={open} onClick={() => setOpen(true)} variant="outlined" >
        Sign In
      </Button>
      <UserCtlDialog open={open} onClose={onClose}/>
    </div> 
  );
};

export default UserCtlButton;