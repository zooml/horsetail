type FormValues = {
  [k: string]: any
}

export default class FormCtl {
  values: FormValues = {}; // can be accessed when all fields are valid
  isValids: {[k: string] :boolean} = {};
  onAllValid = (valid: boolean) => {};

  checkAllValid(): boolean | undefined { // private
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

  areAllValid(): boolean {
    return !!this.checkAllValid();
  }
  
  setOnAllValid(f: (valid: boolean) => void) {
    this.onAllValid = f;
  }

  clearOnAllValid() {
    this.onAllValid = (valid: boolean) => {};
  }

  onValueChg(key: string, value?: any) {
    if (!(key in this.isValids)) {
      console.log(`missing add for form field ${key}`); // WARN
      this.isValids[key] = false;
    }
    if (value === undefined) { // no longer valid
      if (this.isValids[key]) { // changed
        const tmp = this.checkAllValid();
        this.isValids[key] = false;
        if (tmp) { // was all true, now not
          this.onAllValid(false);
        }
      }
    } else {
      this.values[key] = value;
      if (!this.isValids[key]) { // changed
        this.isValids[key] = true;
        if (this.checkAllValid()) { // must have gone all true
          this.onAllValid(true);
        }
      }
    }
  }

  // add field assuming field is initially invalid (unless not required)
  // call back immediately if default value is valid
  // must be called before onValueChg (so all are valid is set appropriately)
  addField(key: string, notReq?: boolean) {
    if (key in this.isValids) {
      console.log(`multiple add of form field ${key}`); // WARN
      return;
    }
    // earlier fields may have called back already with valid default values
    const tmp = this.checkAllValid();
    this.isValids[key] = notReq ?? false;
    if (tmp) { // was all true, now not
      this.onAllValid(false);
    }
  }

  removeField(...keys: string[]) {
    keys.forEach(key => {
      const isV = this.isValids[key];
      if (isV === undefined) {
        console.log(`multiple remove of form field ${key}`); // WARN
      } else {
        const before = this.checkAllValid();
        delete this.values[key];
        delete this.isValids[key];
        if (before === undefined) { // was mixed
          const after = this.checkAllValid();
          if (after !== undefined) { // this was the odd one out
            this.onAllValid(after);
          }
        } else if (before && !Object.keys(this.isValids).length) { // last one and was true
          this.onAllValid(false);
        }
      }
    });
  }
};