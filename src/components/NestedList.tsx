import React, { useEffect, useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import DrCr from './DrCr';
import {accountsLoad, Account, accountsStore} from '../models/account'
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';

const useListStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    }
  }),
);

type ItemStyleProps = {
  level: number
};

const useItemStyles = makeStyles((theme: Theme) =>
  createStyles({
    acct: ({level}: ItemStyleProps) => ({
      display: 'flex',
      width: '100%',
      borderRadius: '1em',
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
      marginLeft: theme.spacing(1 + level * 4),
      marginRight: theme.spacing(level * 4)
    }),
    acctNum: {
      marginLeft: theme.spacing(1.5),
    },
    acctName: {
      marginLeft: theme.spacing(1),
    },
    drCr: {
      marginRight: theme.spacing(1.5),
    },
  }),
);

const AccountChildItems = ({acct, level}: {acct: Account, level: number}) => {
}

const AccountItem = ({acct, level}: {acct: Account, level: number}) => {
  const isParent = !!acct.children.length;
  const classes = useItemStyles({level});
  const [open, setOpen] = useState(false);
  const [changed, setChanged] = useState(false);
  const handleClick = () => {
    setOpen(!open);
  };
  useEffect(() => {
    const s$ = acct.changes$.subscribe({next: () => setChanged(!changed)});
    return () => s$.unsubscribe();
  });
  return (
    <ListItem selected>
      {isParent && (open ? <ExpandLess onClick={handleClick} /> : <ExpandMore onClick={handleClick} />)}
      <ButtonBase focusRipple className={classes.acct}>
        <Typography className={classes.acctNum}>{acct.num}</Typography>
        <Typography className={classes.acctNum} style={{flex: '1', textAlign: 'left'}}>{acct.name}</Typography>
        <DrCr amount={acct.balanceRange} asCr={acct.isCredit} asSum={isParent} className={classes.drCr} />
      </ButtonBase>
    </ListItem>
)};

export default function AccountList() {
  const classes = useListStyles();
  const [, setLoaded] = useState(false);
  useEffect(() => {
    const s$ = accountsLoad().subscribe({next: () => setLoaded(true)});
    return () => s$.unsubscribe();
  });
  return (
    <List
      component="nav"
      className={classes.root}
    >
      {Object.values(accountsStore).map(acct => <AccountItem key={acct.id} acct={acct} level={0} />)}
    </List>
  );
}

export  function NestedList() {
  const classes = useListStyles();
  const [open, setOpen] = React.useState(true);
  const handleClick = () => {
    setOpen(!open);
  };
  useEffect(() => {
    const s$ = accountsLoad().subscribe({
      next: () => console.log('loaded') // TODO render
    });
    return () => s$.unsubscribe();
  });


  // TODO move expand icon to left side: https://stackoverflow.com/questions/57459133/how-to-change-expansion-panel-icon-position-to-the-left
  // order: -1

  return (
    <List
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          Nested List Items
        </ListSubheader>
      }
      className={classes.root}
    >
      <ListItem button>
        <Checkbox />
        <ListItemIcon>
          <SendIcon />
        </ListItemIcon>
        <ListItemText primary="Sent mail" />
      </ListItem>
      <ListItem button>
       <Checkbox />
        <ListItemIcon>
          <DraftsIcon />
        </ListItemIcon>
        <ListItemText primary="Drafts" />
      </ListItem>
      <ListItem button onClick={handleClick}>
        <Checkbox />
        <ListItemIcon>
          <InboxIcon />
        </ListItemIcon>
        <ListItemText primary="Inbox" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem button>
            <Checkbox />
            <ListItemIcon>
              <StarBorder />
            </ListItemIcon>
            <ListItemText primary="Starred" />
          </ListItem>
          <ListItem button>
            <Checkbox />
            <ListItemIcon>
              <StarBorder />
            </ListItemIcon>
            <ListItemText primary="Foo" />
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button>
                <Checkbox />
                <ListItemIcon>
                  <StarBorder />
                </ListItemIcon>
                <ListItemText primary="Hoo" />
                <DrCr amount={123.45} asCr />
                {/* <ListItemText style={{textAlign: 'right', textDecoration: 'underline'}} primary="123.45" /> */}
              </ListItem>
            </List>
          </Collapse>
        </List>
      </Collapse>
    </List>
  );
}
