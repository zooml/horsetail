import React, { useEffect, useRef, useState } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Box from '@material-ui/core/Box'
import * as org from '../models/org';
import { Subscription } from 'rxjs';

const OrgName = () => {
  const [name, setName] = useState('');
  const subscripts = useRef([]);
  useEffect(() => {
    if (!name) {

    }
    const subscripts: Subscription[] = [];
    subscripts.push(org.get$().subscribe({
      next: (o: org.Org) => {
        setName(o.name);
        o.chg$.subscribe({next: (c: org.Chg) => {
          if (c.name) setName(c.name);
        }})
      },
      complete: () => {
        setName('');
      }
    }));
    return () => subscripts.forEach(s => s.unsubscribe());
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
