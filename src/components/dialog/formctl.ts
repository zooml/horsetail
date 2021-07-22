type FormValues = {
  [k: string]: any
}

export default class FormCtl {
  reqs: {[k: string] :boolean} = {};
  values: FormValues = {}; // can be accessed when all fields are valid
  isValids: {[k: string] :boolean} = {};
  allValid = false; // must have at least 1 field to be valid
  onAllValid = (valid: boolean) => {};

  private updateAllValid() {
    let b: boolean | undefined;
    for (const isValid of Object.values(this.isValids)) {
      if (isValid) {
        b = true;
      } else {
        b = false;
        break;
      }
    }
    const prev = this.allValid;
    this.allValid = b === true;
    if (this.allValid !== prev && this.onAllValid) {
      this.onAllValid(this.allValid);
    }
  }

  areAllValid(): boolean {
    return this.allValid;
  }
  
  setOnAllValid(f: (valid: boolean) => void) {
    this.onAllValid = f;
  }

  clearOnAllValid() {
    this.onAllValid = (valid: boolean) => {};
  }

  clearValues() {
    this.values = {};
    this.isValids = {};
    for (const key in this.reqs) {
      this.isValids[key] = !this.reqs[key];
    }
    this.updateAllValid();
  }

  onValueValid(key: string, value: any) {
    const isValid = this.isValids[key];
    if (isValid === undefined) {
      console.log(`formctl WARN: unknown field ${key} onValueChg`);
      return;
    }
    this.values[key] = value;
    if (!isValid) {
      this.isValids[key] = true;
      this.updateAllValid();
    }
  }

  onValueInvalid(key: string) {
    const isValid = this.isValids[key];
    if (isValid === undefined) {console.log(`formctl WARN: unknown field ${key} onValueInvalid`); return;}
    if (isValid) {
      delete this.values[key];
      this.isValids[key] = false;
      this.updateAllValid();
    }
  }

  onValueEmpty(key: string) {
    const req = this.reqs[key];
    if (req === undefined) {console.log(`formctl WARN: unknown field ${key} onValueEmpty`); return;}
    delete this.values[key];
    const isValid = this.isValids[key];
    if (req) {
      if (isValid) {
        this.isValids[key] = false;
        this.updateAllValid();
      }
    } else {
      if (!isValid) {
        this.isValids[key] = true;
        this.updateAllValid();  
      }
    }
  }

  // add field assuming field is initially invalid (unless not required)
  // call back immediately if default value is valid
  // must be called before onValueChg (so all are valid is set appropriately)
  addField(key: string, notReq?: boolean) {
    if (key in this.isValids) {
      console.log(`formctl WARN: multiple add of form field ${key}`);
      return;
    }
    // earlier fields may have called back already with valid default values
    this.reqs[key] = !notReq;
    this.isValids[key] = notReq ?? false;
    this.updateAllValid();  
  }

  removeField(key: string) {
    const req = this.reqs[key];
    if (req === undefined) {console.log(`formctl WARN: multiple remove of form field ${key}`); return;}
    delete this.reqs[key];
    delete this.values[key];
    delete this.isValids[key];
    this.updateAllValid();
  }
};