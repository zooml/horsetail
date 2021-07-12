import { Mdl as OrgMdl } from './org';
import { Mdl as UserMdl } from './user';

let userMdl: UserMdl | undefined;

export const isAllowed = (rsc: string, meth: string, rscId?: string, org?: OrgMdl) => {
  if (!userMdl) return false;
}