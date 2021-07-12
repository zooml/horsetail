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

export type Props = {
  [k: string]: any
};

const AppMenu = (props: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [curOrg, setCurOrg] = useState<org.TldrMdl | undefined>();
  const [orgs, setOrgs] = useState<org.TldrMdls | undefined>();
  const [orgAddOpen, setOrgAddOpen] = useState(false);
  useEffect(() => {
    const subscpt = org.getTldrs$().subscribe({
      next: mdls => setOrgs(mdls), // TODO ???? note no need to subscribe to changes b/c it's a menu
      complete: () => setOrgs(undefined)
    });
    org.loadTldrs();
    return () => subscpt.unsubscribe();
  }, []); // TODO ??? orgs hash will update in the background
  useEffect(() => {
    const subscpt = org.get$().subscribe({
      next: o => setCurOrg(o),
      complete: () => setCurOrg(undefined)
    });
    return () => subscpt.unsubscribe();
  });
  const onMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const onClose = () => setAnchorEl(null);
  const onOrgAddClick = () => setOrgAddOpen(true);
  const onOrgAddClose = () => setOrgAddOpen(false);
  const onOrgClick = (id: string) => {
    if (id === curOrg?.id) org.clear$();
    else org.set(id);
  };
  return (
    <div>
      <IconButton 
        color="inherit" 
        aria-controls="app-menu" aria-haspopup="true"
        onClick={onMenuClick}>
        <MenuIcon/>
      </IconButton>
      <Paper {...props} >
        <Menu
          className="appMenu"
          id="app-menu"
          anchorEl={anchorEl}
          // keepMounted TODO does this cause menu not to be re-created each time????
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          open={Boolean(anchorEl)}
          onClose={onClose}>
          <MenuItem 
            button={false}
            onMouseOver={e => e.preventDefault()} onMouseDown={e => e.preventDefault()}>
            <ListItemIcon>
              <BusinessIcon fontSize="small" />
            </ListItemIcon>
            <Typography style={{flex: 1}} variant="inherit" noWrap>Orgs</Typography>
            <ListItemIcon>
              <IconButton 
                disabled={!orgs || RESOURCES.orgs.perSA.max <= Object.keys(orgs).length} /* TODO need to subtract non-SA when joining supported */
                onClick={onOrgAddClick}>
                <AddIcon fontSize="small" />
              </IconButton>
            </ListItemIcon>
          </MenuItem>
          { orgs && Object.values(orgs).sort((o0, o1) => o0.name < o1.name ? -1 : 1).forEach(o => (
            <MenuItem key={o.id} onClick={() => onOrgClick(o.id)}>
              <div className="menuItemBlankIcon" />
              { o.id === curOrg?.id ? (
                <ListItemIcon>
                  <CheckIcon fontSize="small" />
                </ListItemIcon> ) : (
                <div className="menuItemBlankIcon"/> ) }
              <Typography variant="inherit" noWrap>{o.name}</Typography>
            </MenuItem>
          ))}
          <MenuItem key="id1">
            <div className="menuItemBlankIcon" />
            <ListItemIcon>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>My org number 1</Typography>
          </MenuItem>
          <MenuItem onClick={() => console.log('2')}>
            <div className="menuItemBlankIcon"/>
            <Typography variant="inherit" noWrap>My org number 2 with a really long name 1234123 4123 412 431 341234123412 1</Typography>
          </MenuItem>
        </Menu>
      </Paper>
      <OrgDialog open={orgAddOpen} onClose={onOrgAddClose} />
    </div>
  );
};

export default AppMenu;