import { useEffect, useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import * as org from '../models/org';
import { Subscription } from 'rxjs';
import UserCtl from './UserCtl';
import AppMenu from './AppMenu';
import DateRange from './DateRange';
import PL from './PL';
import Box from '@material-ui/core/Box';

const OrgName = () => {
  const [name, setName] = useState('');
  useEffect(() => {
    // need this to execute when name='' in order to pick up new org.get$() stream
    const subscrpts: Subscription[] = [];
    subscrpts.push(org.get$().subscribe({
      next: (o: org.Mdl) => { // this might be called before above subscribe returns
        setName(o.name);
        subscrpts.push(o.chg$.subscribe({next: (c: org.Chg) => {
          if (c.name) setName(c.name);
        }}));
      },
      complete: () => setName('') // need this to cause useEffect to be recalled
    }));
    return () => subscrpts.forEach(s => s.unsubscribe());
  });
  return (
    <Box>{name}</Box>
  );
};

const NavBar = () => {
  return (
    <AppBar position="static">
      <Toolbar style={{display: 'flex'}}>
        <AppMenu />
        <OrgName />
        <DateRange />
        <PL style={{flexGrow: 1, textAlign: 'center'}}/>
        <UserCtl />
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
