import { ListItemIcon, Typography } from '@material-ui/core';
import { MenuItem, Menu, Paper, IconButton } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import React, { useState } from 'react';
import * as user from '../../models/user';

export type Props = {
  [k: string]: any
};

const UserMenu = (props: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const onButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const onClose = () => setAnchorEl(null);
  return (
    <div>
      <IconButton 
        aria-controls="user-menu" aria-haspopup="true"
        onClick={onButtonClick}>
        <AccountCircleIcon/>
      </IconButton>
      <Paper {...props}>
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          keepMounted
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          open={Boolean(anchorEl)}
          onClose={onClose}>
          <MenuItem onClick={() => user.signOut()}>
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