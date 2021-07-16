import { ListItemIcon, Typography } from '@material-ui/core';
import { MenuItem, Menu, Paper, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CheckIcon from '@material-ui/icons/Check';
import BusinessIcon from '@material-ui/icons/Business';
import React, { useState } from 'react';
import { useEffect } from 'react';
import * as org from '../../models/org';
import { RESOURCES } from '../../common/limits';
import OrgDialog from './OrgDialog';
import { hashToArray } from '../../models/mdl';
import { Subscription } from 'rxjs';

const cmpName = (v0: org.TldrMdl, v1: org.TldrMdl) => v0.name < v1.name ? -1 : 1;

export type Props = {
  [k: string]: any
};

// TODO const OrgActionMenu = () => {
//   return (

//   );
// };

const AppMenu = (props: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selOrg, setSelOrg] = useState<org.TldrMdl | undefined>();
  const [orgs, setOrgs] = useState<org.TldrMdl[] | undefined>();
  const [orgAddDlgOpen, setOrgAddDlgOpen] = useState(false);
  useEffect(() => {
    const subscpts: Subscription[] = [];
    subscpts.push(org.getTldrs$().subscribe({
      next: mdls => {
        subscpts.push(mdls.chg$.subscribe({
          next: () => setOrgs(hashToArray(mdls, cmpName)) // set new array from mdls
        }));
        setOrgs(hashToArray(mdls, cmpName));
      },
      complete: () => setOrgs(undefined)
    }));
    return () => subscpts.forEach(s => s.unsubscribe());
  }, []); // TODO ??? orgs hash will update in the background
  useEffect(() => {
    const subscpt = org.get$().subscribe({
      next: mdl => setSelOrg(mdl),
      complete: () => setSelOrg(undefined)
    });
    return () => subscpt.unsubscribe();
  });
  const onOpenClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const onClose = () => setAnchorEl(null);
  const onOrgAddClick = () => {
    onClose();
    setOrgAddDlgOpen(true);
  };
  const onOrgAddClose = () => setOrgAddDlgOpen(false);
  const onOrgClick = (id: string) => {
    onClose();
    if (id === selOrg?.id) org.clear$();
    else org.set(id);
  };
  return (
    <div>
      <IconButton 
        color="inherit" 
        aria-controls="app-menu" aria-haspopup="true"
        onClick={onOpenClick}>
        <MenuIcon/>
      </IconButton>
      <Paper {...props} >
        <Menu
          className="appMenu"
          id="app-menu"
          anchorEl={anchorEl}
          keepMounted
          getContentAnchorEl={null}
          anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
          transformOrigin={{vertical: 'top', horizontal: 'center'}}
          open={Boolean(anchorEl)}
          onClose={onClose}>
          <MenuItem button={false}>
            <ListItemIcon>
              <BusinessIcon fontSize="small" />
            </ListItemIcon>
            <Typography style={{flex: 1}} variant="inherit" noWrap>Orgs</Typography>
            <ListItemIcon>
              <IconButton 
                disabled={!orgs || RESOURCES.orgs.perSA.max <= orgs.length} /* TODO need to subtract non-SA when invite supported */
                onClick={onOrgAddClick}>
                <AddIcon fontSize="small" />
              </IconButton>
            </ListItemIcon>
          </MenuItem>
          {!orgs ? null : orgs.map(o => (
            <MenuItem key={o.id} onClick={() => onOrgClick(o.id)}>
              <div className="menuItemBlankIcon" />
              { o.id === selOrg?.id ? (
                <ListItemIcon>
                  <CheckIcon fontSize="small" />
                </ListItemIcon> ) : (
                <div className="menuItemBlankIcon"/> ) }
              <Typography variant="inherit" noWrap>{o.name}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </Paper>
      <OrgDialog open={orgAddDlgOpen} onClose={onOrgAddClose} />
    </div>
  );
};

export default AppMenu;