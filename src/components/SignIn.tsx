import React, { FormEvent } from 'react';
import { Button, Dialog, DialogTitle, DialogActions, TextField } from '@material-ui/core';
import * as user from '../models/user';
import FormCtl from './formctl';
import EmailField from './EmailField';
import PswdField from './PswdField';

type Props = {
  open: boolean;
  onClose: () => void;
}
const SignInDialog = ({open, onClose}: Props) => {
  const [allValid, setAllValid] = React.useState(false);
  const formCtl = new FormCtl(valid => setAllValid(valid));
  const onSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('on sign in');
    user.signIn(formCtl.values.email, formCtl.values.pswd);
  }

  return (
    <Dialog onClose={onClose} aria-labelledby="signin-dialog-title" open={open}>
      <DialogTitle id="signin-dialog-title" ><div>Sign in</div><div>Register</div></DialogTitle>
      <form noValidate onSubmit={onSignIn}>
        <EmailField autoFocus onValueChg={formCtl.addField('email')} />
        <PswdField onValueChg={formCtl.addField('pswd')} />
        <DialogActions>
          <Button onClick={onClose} color="primary" variant="text">
            Cancel
          </Button>
          <Button disabled={!allValid} type="submit" color="primary" variant="contained">
            Sign in
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const SignIn = () => {
  const [open, setOpen] = React.useState(false);
  const onClose = () => setOpen(false);
  return (
    <div>
      <Button disabled={open} onClick={() => setOpen(true)} variant="text" style={{textTransform: 'none'}}>
        <div>Sign in</div><div>Register</div>
      </Button>
      <SignInDialog open={open} onClose={onClose}/>
    </div> 
  );
};

export default SignIn;