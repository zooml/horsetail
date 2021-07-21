import { Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Fragment } from 'react';
import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { CATEGORIES } from '../../api/accounts';
import * as account from '../../models/account';
import * as selacct from '../../modelviews/selacct';
import AcctDialog from './AcctDialog';

type Props = {
  innerProps: {[k: string]: any}
};

const haveAllGeneralAccts = (chart: account.Chart) => 
  Object.keys(CATEGORIES).length === chart.length;

const genAvailPrefixes = (acct: account.Mdl) => {

};

export const AcctAddButton = ({innerProps}: Props) => {
  const [chart, setChart] = useState<account.Chart | undefined>();
  const [sel, setSel] = useState<account.Mdl | undefined>();
  const [dis, setDis] = useState(true);
  // const [prefixes, setPrefixes] = useState<string[]>([]);
  const [dlgOpen, setDlgOpen] = useState(false);
  useEffect(() => {
    const subscrpts: Subscription[] = [];
    subscrpts.push(account.get$().subscribe({
      next: chart => {
        setChart(chart);
        setDis(haveAllGeneralAccts(chart));
        subscrpts.push(selacct.get$().subscribe({
          next: acct => {
            setSel(acct);
            setDis(false);

            // TODO check if any room for sub

          },
          complete: () => {
            setSel(undefined);
            setDis(haveAllGeneralAccts(chart));
          }
        }));
      },
      complete: () => {
        setChart(undefined);
        setSel(undefined);
        setDis(true);
      }
    }));
    return () => subscrpts.forEach(s => s.unsubscribe());
  });
  const onClick = () => {
    if (sel) { // non-general account, sel is summary


    } else { // general account

    }
    // TODO dialog, disable first, renable on close
    setDis(true);
    setDlgOpen(true);
  };
  const onDlgClose = () => {
    // TODO recheck avail sub prefixes and call setDis()
    setDis(false);
    setDlgOpen(false);
  };
  return (
    <Fragment>
      <Fab color="primary" aria-label="add account" size="small"
        onClick={onClick} disabled={dis} {...innerProps}>
        <AddIcon />
      </Fab>
      <AcctDialog open={dlgOpen} onClose={onDlgClose} sum={sel} chart={chart} />
    </Fragment>
  );
};

export default AcctAddButton;