import Dlg from '../dialog/Dlg';
import FormCtl from '../dialog/formctl';
import * as account from '../../models/account';
import StrField from '../inputs/StrField';
import { useState } from 'react';
import { FIELDS } from '../../common/limits';
import NumField from '../inputs/NumField';
import SelField, { ChDis } from '../inputs/SelField';
import { CATEGORIES } from '../../api/accounts';

export type Props = {
  open: boolean;
  onClose: () => void;
  sum?: account.Mdl;
  chart?: account.Chart;
};

const toMdlPost = (fc: FormCtl, sum?: account.Mdl): account.MdlPost => {
  const p: account.MdlPost = {
    num: fc.values.num,
    name: fc.values.name
  };
  if (sum) p.sum = sum;
  else p.cat = CATEGORIES[fc.values.catId];
  return p;
};

const genChDis = (chart: account.Chart) =>
  chart.reduce((p, a) => {p[a.cat.id] = true; return p;}, {} as ChDis);

const AcctDialog = ({open, onClose, sum, chart}: Props) => {
  const [formCtl,] = useState(new FormCtl());
  // TODO begAt, desc, isCr
  const onSubmit = () => account.post(toMdlPost(formCtl, sum));
  const selProps = sum
    ? {rdo: true, value: sum.cat.id}
    : {chDis: chart ? genChDis(chart) : {}};
  return (
    <Dlg open={open} onClose={onClose} formCtl={formCtl} onSubmit={onSubmit}
      title="Add Account">
      <SelField formCtl={formCtl} limit={FIELDS.catId} {...selProps} label="Category" />
      <NumField formCtl={formCtl} limit={FIELDS.num} label="Number" />
      <StrField formCtl={formCtl} limit={FIELDS.name} />
    </Dlg>
  );
};

export default AcctDialog;