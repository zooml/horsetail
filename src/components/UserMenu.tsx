import { ListItemIcon, Typography } from '@material-ui/core';
import { MenuItem, Menu, Paper, Button } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
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
      <Button 
        aria-controls="user-menu" aria-haspopup="true"
        onClick={handleClick} variant="outlined">
        G
      </Button>
      <Paper {...props} className="userMenu">
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}>
          <MenuItem>
            <ListItemIcon>
              <SendIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>Orgs</Typography>
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <SendIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>My org number 1</Typography>
          </MenuItem>
          <MenuItem onClick={() => console.log('sign out')}>
            <ListItemIcon>
              <SendIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="inherit" noWrap>Sign Out</Typography>
          </MenuItem>
        </Menu>
      </Paper>
    </div>
  );
};

export default UserMenu;