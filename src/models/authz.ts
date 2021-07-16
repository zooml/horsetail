import * as org from './org';
import * as user from './user';
import * as authzrules from '../common/authzrules';

let curUser: user.Mdl | undefined;
let curOrg: org.TldrMdl | undefined;

export const isAllowed = (rsc: string, meth: string, testOrg?: org.TldrMdl) => {
  if (!curUser) {
    // note isAllowed should only be called after user is set
    user.get$().subscribe({
      next: u => curUser = u, // this should run synchronously
      complete: () => curUser = undefined
    });
    if (!curUser) {
      console.log('authz: user not logged in');
      return false;
    }
  }
  if (!testOrg && !curOrg) {
    // note isAllowed (w/o testOrg) should only be called after org is set
    org.get$().subscribe({
      next: o => curOrg = o, // this should run synchronously
      complete: curOrg = undefined
    });
    if (!curOrg) {
      console.log('authz: org not set');
      return false;
    }
    testOrg = curOrg;
  }
  const orgUser = testOrg?.users.find(u => u.id === curUser?.id);
  if (!orgUser) throw new Error(`authz: org ${testOrg?.id} should never have been read by user ${curUser?.id}`)
  return authzrules.isAllowed(rsc, meth, orgUser.roles);
};