import { useEffect, useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import UserCtl from './UserCtl';
import AppMenu from './AppMenu';
import DateRng from './DateRng';
import PL from './PL';
import Box from '@material-ui/core/Box';
import { get$ as orgGet$ } from '../models/org';
import * as org from '../models/org';

const OrgName = ({org}: {org: org.Mdl | null}) => {
  const [name, setName] = useState('');
  useEffect(() => {
    if (org) {
      setName(org.name);
      const subscpt = org.chg$.subscribe({
        next: (c: org.Chg) => {if (c.name) setName(c.name)}
      });
      return () => subscpt.unsubscribe();
    }
    setName('');
  }, [org]);
  return (
    <Box>{name}</Box>
  );
};

const NavBar = () => {
  const [org, setOrg] = useState<org.Mdl | null>(null);
  useEffect(() => {
    const subscpt = orgGet$().subscribe({
      next: org => setOrg(org),
      complete: () => setOrg(null)
    });
    return subscpt.unsubscribe();
  });
  return (
    <AppBar position="static">
      <Toolbar>
        <AppMenu />
        <OrgName org={org} />
        <DateRng />
        <PL style={{flexGrow: 1, textAlign: 'center'}}/>
        <UserCtl />
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
