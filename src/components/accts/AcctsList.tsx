import { Fragment, memo, useEffect, useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ListAltIcon from '@material-ui/icons/ListAlt';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import DrCr from '../DrCr';
import * as account from '../../models/account';
import { Tooltip } from '@material-ui/core';
import { Arr, copyArr } from '../../models/mdl';
import * as selacct from '../../modelviews/selacct'
import AcctAddButton from './AcctAddButton';
import { useCallback } from 'react';

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
      marginLeft: level + 'em',
      paddingLeft: '.5em',
      paddingRight: level + .5 + 'em', // make look like tab for txndocs list
      borderTopLeftRadius: '1em',
      borderBottomLeftRadius: '1em'
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

type AcctItemsProps = {
  accts: Arr<account.Mdl>;
  level: number;
};

const AcctItems = memo(({accts, level}: AcctItemsProps) => {
  const [subs, setSubs] = useState(accts);
  useEffect(() => {
    const subscrpt = accts.chg$.subscribe({
      // changes are made in-place, so copy array to force re-render
      next: chg => setSubs(copyArr(accts))
    });
    return () => subscrpt.unsubscribe();
  }, [accts]);
  return (
    <Fragment>
      {subs.map(a => <AcctItem key={a.id} acct={a} level={level} />)}
    </Fragment>
  );
});

type AcctItemProps = {
  acct: account.Mdl;
  level: number;
};

const AcctItem = memo(({acct, level}: AcctItemProps) => {
  const classes = useItemStyles({level});
  const [num, setNum] = useState(acct.num);
  const [name, setName] = useState(acct.name);
  const [hasSubs, setHasSubs] = useState(0 < acct.subs.length);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(false);
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
  const tglOpen = useCallback(e => {
    setOpen(!open);
    e.stopPropagation(); 
  }, [open]);
  const onClick = useCallback(() => {
    if (selacct.set(acct)) { // new selection
      setSel(true);
      selacct.get$().subscribe({
        complete: () => setSel(false)
      });
    }
  }, [acct]);
  // TODO double-click == edit
  return (
    <Fragment>
      <ListItem key={acct.id} button className={classes.root}
         onClick={onClick} selected={sel}>
        {hasSubs
          ? (open ? <ExpandLess onClick={tglOpen} /> : <ExpandMore onClick={tglOpen} />)
          : <ExpandLess style={{visibility: "hidden"}} />}
        <Tooltip title={num}>
          <ListItemText primary={name} />
        </Tooltip>
        <DrCr amt={123.45} asCr={acct.isCr} />
      </ListItem>
      {hasSubs &&
        <Collapse in={open} timeout="auto">
          <List component="div" disablePadding>
            <AcctItems accts={acct.subs} level={level + 1} />
          </List>
        </Collapse>}
    </Fragment>
  );
});

export function AcctsList() {
  const classes = useListStyles();
  const classesItem = useItemStyles({level: 0});
  const [chart, setChart] = useState<account.Chart | undefined>();
  const [sel, setSel] = useState(true);
  useEffect(() => {
    const subscrpt = account.get$().subscribe({
      next: chart => setChart(chart),
      complete: () => setChart(undefined)
    });
    return () => subscrpt.unsubscribe();
  });
  useEffect(() => {
    const subscrpt = selacct.get$().subscribe({
      next: () => setSel(false),
      complete: () => setSel(true),
    });
    return () => subscrpt.unsubscribe();
  });
  // no sel implies "all"
  const onAllClick = useCallback(() => selacct.clear(), []); 
  return (
    <Fragment>
      <List component="nav" className={classes.root} hidden={!chart}>
        <ListItem key="all" button onClick={onAllClick}
          selected={sel} 
          className={classesItem.root}>
          <ListItemIcon>
            <ListAltIcon />
          </ListItemIcon>
          <ListItemText primary="Accounts" />
        </ListItem>
        {chart && <AcctItems accts={chart} level={0} />}
      </List>
      <AcctAddButton innerProps={{style: {position: "absolute", bottom: '1em', right: '1em'}}} />
    </Fragment>
);
}
