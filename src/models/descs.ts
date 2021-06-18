import { Get } from '../api/desc';

export type Mdl = Get; // no fields to convert

export type Chg = {
  id?: string;
  url?: string;
  note?: string;
};

export const fromGet = (g: Get): Mdl => g;
