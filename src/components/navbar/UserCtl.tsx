import { useEffect, useState } from 'react';
import UserCtlButton from './UserCtlButton'
import UserMenu from './UserMenu'
import * as user from '../../models/user';

const UserCtl = () => {
  const [state, setState] = useState(0);
  useEffect(() => {
    const subscpt = user.get$().subscribe({
      next: u => setState(2),
      complete: () => setState(1)
    });
    return () => subscpt.unsubscribe();
  });
  return (
    <div className="userCtl">
      {(state === 1) ? <UserCtlButton /> : (
        (state === 2) ? <UserMenu /> : null)}
    </div>
  );
};

export default UserCtl;