import { Subject } from "rxjs";

export type Action = {
  label: string;
  onClick: () => void;
};

export type Alert = {
  severity: number; // 0: error, 1: warning, 2: success, 3: info
  message: string;
  action?: Action;
};

const alert$ = new Subject<void>();
const alerts: Alert[] = [];

export const get$ = () => alert$;

export const pop = (): Alert | undefined => {
  return alerts.length ? alerts.shift() : undefined;
}

export const push = (alert: Alert): void => {
  alerts.push(alert);
  if (alerts.length === 1) {
    alert$.next();
  }
};
