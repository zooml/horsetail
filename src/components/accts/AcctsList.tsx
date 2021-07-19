import React, { Fragment, memo, useEffect, useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ListAltIcon from '@material-ui/icons/ListAlt';
import AddIcon from '@material-ui/icons/Add';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import DrCr from '../DrCr';
import * as account from '../../models/account';
import { Fab, Tooltip } from '@material-ui/core';
import { Arr, copyArr } from '../../models/mdl';

const useListStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      // '& .MuiListItem-root > .MuiSvgIcon-root': {
      //   order: -1
      // },
      '& .MuiListItem-root': {
        paddingTop: 0,
        paddingBottom: 0,
      },
    }
  }),
);

type ItemStyleProps = {
  level: number;
};

const useItemStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: ({level}: ItemStyleProps) => ({
      display: 'flex',
      width: '100%',
      // borderRadius: '1em',
      // backgroundColor: theme.palette.primary.light,
      // color: theme.palette.primary.contrastText,
      // if !hasSubs add 24px
      paddingLeft: 0, // theme.spacing(1 + level),
      paddingRight: 0, //theme.spacing(0)
    }),
    // acctNum: {
    //   marginLeft: theme.spacing(1.5),
    // },
    // acctName: {
    //   marginLeft: theme.spacing(1),
    // },
    // drCr: {
    //   marginRight: theme.spacing(1.5),
    // },
  }),
);

type AcctSubItemsProps = {
  open: boolean;
  accts: Arr<account.Mdl>;
  level: number;
};

const AcctSubItems = memo(({open, accts, level}: AcctSubItemsProps) => {
  const [subs, setSubs] = useState(accts);
  useEffect(() => {
    const subscrpt = accts.chg$.subscribe({
      // changes are made in-place, so copy array to force re-render
      next: chg => setSubs(copyArr(accts))
    });
    return () => subscrpt.unsubscribe();
  }, [accts]);
  return (
    <Collapse in={open} timeout="auto">
      <List component="div" disablePadding>
        {subs.map(a => <AcctItem key={a.id} acct={a} level={level} />)}
      </List>
    </Collapse>
  );
});

type AcctItemProps = {
  acct: account.Mdl;
  level: number;
};

const AcctItem = memo(({acct, level}: AcctItemProps) => {
  const classes = useItemStyles({level});
  const [open, setOpen] = useState(false);
  const [num, setNum] = useState(acct.num);
  const [name, setName] = useState(acct.name);
  const [hasSubs, setHasSubs] = useState(0 < acct.subs.length);
  const tglOpen = () => setOpen(!open);
  useEffect(() => {
    const subscrpt = acct.chg$.subscribe({
      next: chg => {
        if (chg.num) setNum(chg.num);
        if (chg.name) setName(chg.name);
      }
    });
    return () => subscrpt.unsubscribe();
  }, [acct.chg$]);
  useEffect(() => {
    const subscrpt = acct.subs.chg$.subscribe({
      next: chg => setHasSubs(0 < acct.subs.length)
    });
    return () => subscrpt.unsubscribe();
  }, [acct.subs]);
  return (
    <Fragment>
      <ListItem key={acct.id} button className={classes.root}>
        {hasSubs
          ? (open ? <ExpandLess onClick={tglOpen} /> : <ExpandMore onClick={tglOpen} />)
          : <ExpandLess style={{visibility: "hidden"}} />}
        <Tooltip title={num}>
          <ListItemText primary={name} />
        </Tooltip>
        <DrCr amt={123.45} asCr={acct.isCr} />
      </ListItem>
      {hasSubs && <AcctSubItems key={`s${acct.id}`} accts={acct.subs} open={open} level={level + 1} />}
    </Fragment>
  );
});

export const AcctAddButton = () => {
  return (
    <Fab color="primary" aria-label="add account" size="small" style={{position: "absolute", bottom: '1em', right: '1em'}}> 
      <AddIcon />
    </Fab>
  );
};

export function AcctsList() {
  const classes = useListStyles();
  const [chart, setChart] = useState<account.Chart | undefined>();
  useEffect(() => {
    const subscrpt = account.get$().subscribe({
      next: chart => setChart(chart),
      complete: () => setChart(undefined)
    });
    return () => subscrpt.unsubscribe();
  }, []);
  const onAllClick = () => {};
  return (
    <Fragment>
      <List component="nav" className={classes.root}>
        <ListItem button onClick={onAllClick}>
          <ListItemIcon>
            <ListAltIcon />
          </ListItemIcon>
          <ListItemText primary="Accounts" />
        </ListItem>
        {chart?.map(a => <AcctItem key={a.id} acct={a} level={0} />)}
        {/* <ListItem button>
          <ListItemIcon>
            <ListAltIcon />
          </ListItemIcon>
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
          {open ? <ExpandLess /> : <ExpandMore />}
          <ListItemText primary="Assets" onClick={e => {
            e.stopPropagation();
          }}/>
          <div onClick={e => e.stopPropagation()}>
            <DrCr amt={123.45} asCr />
          </div>
        </ListItem>
        <Collapse in={open} timeout="auto">
          <List component="div" disablePadding>
            <ListItem button className={itemClasses.acct}>
              <div style={{width: '24px'}}/>
              <ListItemIcon style={{visibility: "hidden"}}>
                <ExpandLess />
              </ListItemIcon>
              <div style={{width: '1em'}}/>
              <Tooltip title="3100" arrow>
                <ListItemText primary="Cash" />
              </Tooltip>
              <DrCr amt={123.45} asCr />
              <div style={{width: '1em'}}/>
            </ListItem>
            <ListItem button className={itemClasses.acct}>
              {open ? <ExpandLess /> : <ExpandMore />}
              <ListItemText primary="Foo" />
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
                  <ListItemText style={{textAlign: 'right', textDecoration: 'underline'}} primary="123.45" />
                </ListItem>
              </List>
            </Collapse>
          </List>
        </Collapse> */}
      </List>
      <AcctAddButton />
    </Fragment>
);
}
