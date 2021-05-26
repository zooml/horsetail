import { Button } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
// import { withStyles } from "@material-ui/core/styles";
import React from "react";
import './App.css';
import Alerter from "./components/Alerter";
import NavBar from './components/NavBar';
import UserCtlButton from './components/UserCtlButton';
import { GlobalCss } from "./GlobalCss";
// import { accountsLoad } from "./models/account";
import * as alert from './models/alert';
import * as user from './models/user';
// import NestedList from './components/NestedList'
// import AccountsTree from './components/AccountsTree'
//import DocumentsTable, {data, columns} from './components/DocumentsTable';
//import VList from './components/VList'
// import DrCr from './components/DrCr'

function App() {

  // setTimeout(() => alert.push({message: 'Hi'}), 2000);

  return (
    <div className="App">
      <CssBaseline/>
      <GlobalCss />
      <NavBar/>
      <UserCtlButton/>
      {/* <NestedList /> */}
      {/* <AccountsTree /> */}
      {/* <DocumentsTable data={data} columns={columns} /> */}
      {/* <VList/> */}
      {/* <DrCr amount={-100.23} asCr={false} /> */}
      <Button onClick={() => {
        user.getIsInitSessionValid$()
          .subscribe({next: v => alert.push({
            severity: 2,
            message: `Hello, world! ${v}`,
            action: {label: 'done', onClick: () => console.log('clicked')}
          })});
      }} >ajax</Button>
      <Button onClick={() => alert.push({
        severity: 2,
        message: `Hello, world! ${Date.now()}`,
        action: {label: 'ClickMe', onClick: () => console.log('clicked')}
      })} >alert</Button>
      <Alerter />
    </div>
  );
}

export default App;
