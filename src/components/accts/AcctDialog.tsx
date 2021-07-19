import Dlg from '../dialog/Dlg';
import FormCtl from '../dialog/formctl';
import * as account from '../../models/account';
import StrField from '../inputs/StrField';
import { useState } from 'react';
import { FIELDS } from '../../common/limits';

export type Props = {
  open: boolean;
  onClose: () => void;
};

const toMdlPost = (fc: FormCtl): account.MdlPost => ({
  num: fc.values.num,
  name: fc.values.name
});

const AcctDialog = ({open, onClose}: Props) => {
  const [formCtl,] = useState(new FormCtl());
  // TODO begAt, desc
  const onSubmit = () => account.post(toMdlPost(formCtl));
  return (
    <Dlg open={open} onClose={onClose} formCtl={formCtl} onSubmit={onSubmit}>
      <StrField formCtl={formCtl} limit={FIELDS.name} />
    </Dlg>
  );
};

export default AcctDialog;