import Dlg from '../dialog/Dlg';
import FormCtl from '../dialog/formctl';
import * as org from '../../models/org';
import StrField from '../inputs/StrField';
import { useState } from 'react';
import { FIELDS } from '../../common/limits';
import { today } from '../../utils/clndate';

export type Props = {
  open: boolean;
  onClose: () => void;
};

const OrgDialog = ({open, onClose}: Props) => {
  const [formCtl,] = useState(new FormCtl());
  // TODO begAt, desc
  const onSubmit = () => org.post({name: formCtl.values.name, begAt: today()});
  return (
    <Dlg open={open} onClose={onClose} formCtl={formCtl} onSubmit={onSubmit}>
      <StrField formCtl={formCtl} limit={FIELDS.name} />
    </Dlg>
  );
};

export default OrgDialog;