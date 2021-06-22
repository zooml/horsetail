


// TODO set key

import { ListItemIcon, Typography } from '@material-ui/core';
import { MenuItem, Menu, Paper, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CheckIcon from '@material-ui/icons/Check';
import StoreMallDirectoryIcon from '@material-ui/icons/StoreMallDirectory';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import React, { useState } from 'react';

export type Props = {
  [k: string]: any
};

const AppMenu = (props: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  // MuiListItemIcon-root min-width: 56px
  return (
    <div>
      <IconButton 
        color="inherit" 
        aria-controls="app-menu" aria-haspopup="true"
        onClick={handleClick}>
        <MenuIcon/>
      </IconButton>
      <Paper {...props} >
        <Menu
          className="appMenu"
          id="app-menu"
          anchorEl={anchorEl}
          keepMounted
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          open={Boolean(anchorEl)}
          onClose={handleClose}>
          <MenuItem 
            button={false}
            onMouseOver={e => e.preventDefault()} onMouseDown={e => e.preventDefault()}>
            <ListItemIcon>
              <StoreMallDirectoryIcon fontSize="small" />
            </ListItemIcon>
            <Typography style={{flex: 1}} variant="inherit" noWrap>Orgs</Typography>
            <ListItemIcon>
              <IconButton><AddIcon fontSize="small" /></IconButton>
            </ListItemIcon>
          </MenuItem>
          <MenuItem key="id1">
            <div className="menuItemNoIcon" />
            <Typography variant="inherit" noWrap>My org number 1</Typography>
          </MenuItem>
          <MenuItem onClick={() => console.log('2')}>
            <div className="menuItemNoIcon"/>
            <Typography variant="inherit" noWrap>My org number 2 with a really long name 1234123 4123 412 431 341234123412 1</Typography>
          </MenuItem>
        </Menu>
      </Paper>
    </div>
  );
};

export default AppMenu;