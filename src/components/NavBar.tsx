import { useEffect, useState } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Box from '@material-ui/core/Box'
import * as org from '../models/org';
import { Subscription } from 'rxjs';

const OrgName = () => {
  const [name, setName] = useState('');
  useEffect(() => {
    const subscrpts: Subscription[] = [];
    subscrpts.push(org.get$().subscribe({
      next: (o: org.Mdl) => { // this might be called before subscribe returns
        setName(o.name);
        subscrpts.push(o.chg$.subscribe({next: (c: org.Chg) => {
          if (c.name) setName(c.name);
        }}));
      },
      complete: () => setName('') // need this to cause useEffect to be recalled
    }));
    return () => subscrpts.forEach(s =>s.unsubscribe());
  });
  return (
    <Box>${name}</Box>
  );
};

const NavBar = () => {
  return(
    <AppBar position="static">
        <Toolbar>
          <OrgName />
        </Toolbar>
    </AppBar>
  )
}

export default NavBar;
