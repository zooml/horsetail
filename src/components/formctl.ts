type FormValues = {
  [key: string]: any
}

// fields call this: (1) with their valid values when they change, 
// (2) with undefined when field is not valid
export type FieldOnValueChg = (value?: any) => void;

export default class FormCtl {
  values: FormValues = {}; // can be accessed when all fields are valid
  valids: {[key: string] :boolean} = {};
  onAllValid: (valid: boolean) => void;

  constructor(onAllValid: (valid: boolean) => void) {
    this.onAllValid = onAllValid;
  }

  checkAllValid(): boolean | undefined { // private
    let res: boolean | undefined = undefined;
    for (const valid of Object.values(this.valids)) {
      if (res === undefined) {
        res = valid;
      } else if (res) {
        if (!valid) return undefined;
      } else {
        if (valid) return undefined;
      }
    }
    return res;
  }

  onFieldValueChg(key: string, value?: any) { // private
    if (value === undefined) { // no longer valid
      if (this.valids[key] !== false) {
        this.valids[key] = false;
        const tmp = this.checkAllValid();
        if (tmp !== undefined && !tmp) this.onAllValid(false);
      }
    } else {
      this.values[key] = value;
      if (this.valids[key] !== true) {
        this.valids[key] = true;
        if (this.checkAllValid()) this.onAllValid(true);
      }
    }
  }

  // add field and return field callback, assumes field is initially invalid so
  // field must call back immediately if default value is valid
  addField(key: string): FieldOnValueChg {
    this.valids[key] = false;
    return this.onFieldValueChg.bind(this, key);
  }
};