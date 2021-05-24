type FormValues = {
  [key: string]: any
}

// fields call this: (1) with their valid values when they change, 
// (2) with undefined when field is not valid
export type FieldOnValueChg = (value?: any) => void;

export default class FormCtl {
  values: FormValues = {}; // can be accessed when all fields are valid
  isValids: {[key: string] :boolean} = {};
  onAllAreValid = (valid: boolean) => {};

  checkAllAreValid(): boolean | undefined { // private
    let isAllValid: boolean | undefined = undefined;
    for (const isValid of Object.values(this.isValids)) {
      if (isAllValid === undefined) {
        isAllValid = isValid;
      } else if (isAllValid) {
        if (!isValid) return undefined;
      } else {
        if (isValid) return undefined;
      }
    }
    return isAllValid;
  }

  allAreValid(): boolean {
    return !!this.checkAllAreValid();
  }
  
  setOnAllAreValid(f: (valid: boolean) => void) {
    this.onAllAreValid = f;
  }

  onFieldValueChg(key: string, value?: any) { // private
    if (value === undefined) { // no longer valid
      if (this.isValids[key]) { // changed
        const tmp = this.checkAllAreValid();
        this.isValids[key] = false;
        if (tmp) { // was all true, now not
          this.onAllAreValid(false);
        }
      }
    } else {
      this.values[key] = value;
      if (!this.isValids[key]) { // changed
        this.isValids[key] = true;
        if (this.checkAllAreValid()) { // must have gone all true
          this.onAllAreValid(true);
        }
      }
    }
  }

  // add field and return field callback, assumes field is initially invalid so
  // field must call back immediately if default value is valid
  addField(key: string): FieldOnValueChg {
    if (this.isValids[key] === undefined) {
      // earlier fields may have called back already with valid default values
      const tmp = this.checkAllAreValid();
      this.isValids[key] = false;
      if (tmp) { // was all true, now not
        this.onAllAreValid(false);
      }
      console.log(`added ${key}: ${this.checkAllAreValid()}`);
    }
    return this.onFieldValueChg.bind(this, key);
  }

  removeField(...keys: string[]) {
    keys.forEach(key => {
      const isV = this.isValids[key];
      if (isV !== undefined) {
        const before = this.checkAllAreValid();
        delete this.values[key];
        delete this.isValids[key];
        if (before === undefined) { // was mixed
          const after = this.checkAllAreValid();
          if (after !== undefined) { // this was the odd one out
            this.onAllAreValid(after);
          }
        } else if (before && !Object.keys(this.isValids).length) { // last one and was true
          this.onAllAreValid(false);
        }
        console.log(`removed ${key}: ${this.checkAllAreValid()}`);
      }
    });
  }
};