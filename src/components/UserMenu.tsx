import { ListItemIcon, Typography } from '@material-ui/core';
import { MenuItem, Menu, Paper, IconButton } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import React, { useState } from 'react';

export type Props = {
  [k: string]: any
};

const UserMenu = (props: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  return (
    <div>
      <IconButton 
        aria-controls="user-menu" aria-haspopup="true"
        onClick={handleClick}>
        <AccountCircleIcon/>
      </IconButton>
      <Paper {...props} className="userMenu">
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          keepMounted
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          open={Boolean(anchorEl)}
          onClose={handleClose}>
          <MenuItem onClick={() => console.log('sign out')}>
            <ListItemIcon>
              <ExitToAppIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>Sign out</Typography>
          </MenuItem>
        </Menu>
      </Paper>
    </div>
  );
};

export default UserMenu;