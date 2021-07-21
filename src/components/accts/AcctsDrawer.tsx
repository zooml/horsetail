import { createStyles, Drawer, Hidden, makeStyles, Theme, Toolbar, useTheme } from "@material-ui/core";
import { useState } from "react";
import { AcctsList } from "./AcctsList";

const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    drawer: {
      [theme.breakpoints.up('sm')]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    drawerContainer: {
      overflow: 'auto',
    },
    drawerPaper: {
      width: drawerWidth,
    },
  }),
);

const AcctsDrawer = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const onDrawerToggle = () => setMobileOpen(!mobileOpen);
  // TODO swipeable???
  // https://material-ui.com/components/drawers/#swipeable
  const drawer = (
    <div className={classes.drawerContainer}>
      <AcctsList />
    </div>
  );
// TODO needed??? If you are using the ‘temporary’ Drawer variant and you 
// want to remove the Backdrop, it’s possible with CSS. Add 
// the following to our existing class:
// drawer: {
//   "& .MuiBackdrop-root": {
//     display: "none"
//   }
// }
  return (
    <nav className={classes.drawer} aria-label="accounts">
      <Hidden smUp implementation="css">
        <Drawer classes={{paper: classes.drawerPaper}}
          variant="temporary"
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open={mobileOpen}
          onClose={onDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}>
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden xsDown implementation="css">
        <Drawer classes={{paper: classes.drawerPaper}}
          variant="permanent"
          open>
          <Toolbar />
          {drawer}
        </Drawer>
      </Hidden>      
    </nav>
  );
};

export default AcctsDrawer;