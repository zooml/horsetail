import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    'text-align': 'left',
  },
});

export default function AccountsTree() {
  const classes = useStyles();
  return (
    <TreeView
      className={classes.root}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      // 'multiSelect' crosses groups, cannot expand w/o selecting
    >
      <TreeItem nodeId="1" label="Assets $221">
        <TreeItem nodeId="2" label="1000 Cash $123" />
        <TreeItem nodeId="3" label="1100 Accounts Receivable $98" />
      </TreeItem>
      <TreeItem nodeId="5" label="Liabilities $188">
        <TreeItem nodeId="6" label="2000 Payables $56" />
        <TreeItem nodeId="7" label="2100 Accrued liabilities $98" />
        <TreeItem nodeId="8" label="2300 Unearned/deferred revenue $34" />
      </TreeItem>
      <TreeItem nodeId="100" label="Net $33"/>
    </TreeView>
  );
}