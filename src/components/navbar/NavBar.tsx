import { useEffect, useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import AppMenu from './AppMenu';
import DateRng from './DateRng';
import PL from './PL';
import * as user from '../../models/user';
import { createStyles, makeStyles, Theme, Typography } from '@material-ui/core';
import UserCtlButton from './UserCtlButton';
import UserMenu from './UserMenu';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      // [theme.breakpoints.up('sm')]: {
      //   width: `calc(100% - ${drawerWidth}px)`,
      //   marginLeft: drawerWidth,
      // },
    },
  }),
);

const NavBar = () => {
  const classes = useStyles();
  const [signedIn, setSignedIn] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    const subscpt = user.get$().subscribe({
      next: u => setSignedIn(true),
      complete: () => setSignedIn(false)
    });
    return () => subscpt.unsubscribe();
  });
  return (
    <AppBar position="fixed" className={classes.appBar}>
      { signedIn === false
        ? <Toolbar>
            <Typography>About Contact</Typography>
            <UserCtlButton style={{marginLeft: 'auto'}}/>
          </Toolbar>
        : (signedIn === true
          ? <Toolbar>
              <AppMenu />
              <DateRng />
              <PL style={{flexGrow: 1}}/>
              <UserMenu />
            </Toolbar>
          : <Toolbar />)}
    </AppBar>
  );
};

export default NavBar;
