import { Subject } from "rxjs";

export type Action = {
  label: string;
  onClick: () => void;
};

export type Alert = {
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
