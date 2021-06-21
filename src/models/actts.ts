import { Get } from '../api/actt';
import { toDate } from '../common/acctdate';
import * as descs from './descs';

export type Mdl = {
  at: Date;
  isAct: boolean;
  desc: descs.Mdl;
};

export const fromGet = (g: Get): Mdl => ({
  at: toDate(g.at),
  isAct: g.isAct,
  desc: descs.fromGet(g.desc)
});
