import { useEffect, useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import AppMenu from './AppMenu';
import DateRng from './DateRng';
import PL from './PL';
import * as user from '../../models/user';
import { Typography } from '@material-ui/core';
import UserCtlButton from './UserCtlButton';
import UserMenu from './UserMenu';

const NavBar = () => {
  const [signedIn, setSignedIn] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    const subscpt = user.get$().subscribe({
      next: u => setSignedIn(true),
      complete: () => setSignedIn(false)
    });
    return () => subscpt.unsubscribe();
  });
  return (
    <AppBar position="static">
      { signedIn === false
        ? <Toolbar>
            <Typography>About Contact</Typography>
            <UserCtlButton style={{marginLeft: 'auto'}}/>
          </Toolbar>
        : (signedIn === true
          ? <Toolbar>
              <AppMenu />
              <DateRng />
              <PL style={{flexGrow: 1, textAlign: 'center'}}/>
              <UserMenu />
            </Toolbar>
          : <Toolbar />)}
    </AppBar>
  );
};

export default NavBar;
