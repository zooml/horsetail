import { useEffect, useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import AppMenu from './AppMenu';
import DateRng from './DateRng';
import PL from './PL';
import Box from '@material-ui/core/Box';
import { get$ as orgGet$ } from '../../models/org';
import * as org from '../../models/org';
import * as user from '../../models/user';
import { Typography } from '@material-ui/core';
import UserCtlButton from './UserCtlButton';
import UserMenu from './UserMenu';
import { Subscription } from 'rxjs';

const OrgName = () => {
  const [name, setName] = useState('');
  useEffect(() => {
    const subscpts: Subscription[] = [];
    subscpts.push(orgGet$().subscribe({
      next: org => {
        setName(org.name);
        subscpts.push(org.chg$.subscribe({
          next: (c: org.Chg) => {if (c.name) setName(c.name)}
        }));
      },
      complete: () => setName('')
    }));
    return () => subscpts.forEach(s => s.unsubscribe());
  });
  return (
    <Box>{name}</Box>
  );
};

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
              <OrgName />
              <DateRng />
              <PL style={{flexGrow: 1, textAlign: 'center'}}/>
              <UserMenu />
            </Toolbar>
          : <Toolbar />) }
    </AppBar>
  );
};

export default NavBar;
