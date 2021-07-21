// import { Button, Card, CardMedia, Container, Paper } from "@material-ui/core";
import { createStyles, Fab, makeStyles, Theme, Toolbar, Typography } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
// import { withStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
// import { Subject } from "rxjs";
import './App.css';
import AcctsDrawer from "./components/accts/AcctsDrawer";
import Alerter from "./components/Alerter";
import NavBar from './components/navbar/NavBar';
// import UserCtlButton from './components/UserCtlButton';
import { GlobalCss } from "./GlobalCss";
import AddIcon from '@material-ui/icons/Add';
// import * as alert from './models/alert';
// import * as user from './models/user';
// import NestedList from './components/NestedList'
// import AccountsTree from './components/AccountsTree'
//import DocumentsTable, {data, columns} from './components/DocumentsTable';
//import VList from './components/VList'
// import DrCr from './components/DrCr'
// import { Box } from "@material-ui/core"; // must be last import
// import horsetail from '../public/static/images/horsetail-grass.jpg';
// import PubContent from "./pubsite/PubContent";
// import UserMenu from "./components/navbar/UserMenu";
import * as user from './models/user';
import PubContent from "./pubsite/PubContent";

const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      [theme.breakpoints.up('sm')]: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
      },
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
      width: drawerWidth,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
  }),
);

const App = () => {
  const classes = useStyles();
  const [signedIn, setSignedIn] = useState<boolean>(false);
  useEffect(() => {
    const subscpt = user.get$().subscribe({
      next: () => setSignedIn(true),
      complete: () => setSignedIn(false)
    });
    return () => subscpt.unsubscribe();
  });
  return (
    <div className="App" style={{display: 'flex'}}>
      <CssBaseline/>
      <GlobalCss />
      <NavBar/>
      {signedIn 
        ? <div style={{display: 'flex'}}>
            <AcctsDrawer />
            <main className={classes.content}>
              <Toolbar />
              <Fab color="primary" aria-label="add document" size="small" style={{position: "absolute", bottom: '1em', right: '1em'}}> 
                <AddIcon />
              </Fab>
              <Typography paragraph>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                ut labore et dolore magna aliqua. Rhoncus dolor purus non enim praesent elementum
                facilisis leo vel. Risus at ultrices mi tempus imperdiet. Semper risus in hendrerit
                gravida rutrum quisque non tellus. Convallis convallis tellus id interdum velit laoreet id
                donec ultrices. Odio morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit
                adipiscing bibendum est ultricies integer quis. Cursus euismod quis viverra nibh cras.
                Metus vulputate eu scelerisque felis imperdiet proin fermentum leo. Mauris commodo quis
                imperdiet massa tincidunt. Cras tincidunt lobortis feugiat vivamus at augue. At augue eget
                arcu dictum varius duis at consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem
                donec massa sapien faucibus et molestie ac.
              </Typography>
            </main>
            <Alerter />
          </div>
        : <PubContent />
      }
    </div>
  );
}

export default App;
