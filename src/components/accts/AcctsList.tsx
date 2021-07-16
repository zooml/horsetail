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
import DrCr from '../DrCr';
import * as account from '../../models/account';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';

const useListStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      '& .MuiListItem-root > .MuiSvgIcon-root': {
        order: -1
      },
      '& .MuiListItem-root': {
        paddingTop: 0,
        paddingBottom: 0,
      },
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

const AcctChildItems = ({acct, level}: {acct: account.Mdl, level: number}) => {

}

const AcctItem = ({acct, level}: {acct: account.Mdl, level: number}) => {
  const isParent = !!acct.subs.length;
  const classes = useItemStyles({level});
  const [open, setOpen] = useState(false);
  const [changed, setChanged] = useState(false);
  const handleClick = () => {
    setOpen(!open);
  };
  useEffect(() => {
    const s$ = acct.chg$.subscribe({next: () => setChanged(!changed)});
    return () => s$.unsubscribe();
  });
  return (
    <ListItem selected>
      {isParent && (open ? <ExpandLess onClick={handleClick} /> : <ExpandMore onClick={handleClick} />)}
      <ButtonBase focusRipple className={classes.acct}>
        <Typography className={classes.acctNum}>{acct.num}</Typography>
        <Typography className={classes.acctNum} style={{flex: '1', textAlign: 'left'}}>{acct.name}</Typography>
        <DrCr amt={10} asCr={acct.isCr} asSum={isParent} className={classes.drCr} />
      </ButtonBase>
    </ListItem>
)};

export  function AcctsList() {
  const classes = useListStyles();
  const [open, setOpen] = React.useState(true);
  const handleClick = () => {
    setOpen(!open);
  }; 
  useEffect(() => {
    const subscrpt = account.get$().subscribe({
      next: chart => console.log('accounts loaded'),
      complete: () => {} // TODO clear
    });
    return () => subscrpt.unsubscribe();
  }, []);
  return (
    <List component="nav" className={classes.root}>
      <ListItem button>
        <ListItemText primary="Accounts" />
      </ListItem>
      <ListItem button selected={true}>
        <Checkbox size="small"/>
        <ListItemIcon>
          <SendIcon />
        </ListItemIcon>
        <ListItemText primary="Sent mail" />
      </ListItem>
      <ListItem button>
       <Checkbox size="small" />
        <ListItemIcon>
          <DraftsIcon />
        </ListItemIcon>
        <ListItemText primary="Drafts" />
      </ListItem>
      <ListItem button onClick={handleClick}>
        <Checkbox size="small" onClick={e => {
          e.stopPropagation();
        }}/>
        {/* <ListItemIcon>
          <InboxIcon />
        </ListItemIcon> */}
        <ListItemText primary="Inbox" onClick={e => {
          e.stopPropagation();
        }}/>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem button>
            <div style={{width: '24px'}}/>
            <div style={{width: '1em'}}/>
            <Checkbox size="small" onChange={e => {
              console.log('click');
            }}/>
            {/* <ListItemIcon>
              <StarBorder />
            </ListItemIcon> */}
            <ListItemText primary="Starred" />
          </ListItem>
          <ListItem button>
            <Checkbox size="small" />
            <ListItemIcon>
              <StarBorder />
            </ListItemIcon>
            <ListItemText primary="Foo" />
            {open ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button>
                <Checkbox size="small" />
                <ListItemIcon>
                  <StarBorder />
                </ListItemIcon>
                <ListItemText primary="Hoo" />
                <DrCr amt={123.45} asCr />
                {/* <ListItemText style={{textAlign: 'right', textDecoration: 'underline'}} primary="123.45" /> */}
              </ListItem>
            </List>
          </Collapse>
        </List>
      </Collapse>
    </List>
  );
}
