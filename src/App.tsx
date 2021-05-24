import CssBaseline from "@material-ui/core/CssBaseline";
import { withStyles } from "@material-ui/core/styles";
import React from "react";
import './App.css';
import NavBar from './components/NavBar';
import UserCtlButton from './components/UserCtlButton';
import { GlobalCss } from "./GlobalCss";
// import NestedList from './components/NestedList'
// import AccountsTree from './components/AccountsTree'
//import DocumentsTable, {data, columns} from './components/DocumentsTable';
//import VList from './components/VList'
// import DrCr from './components/DrCr'

function App() {
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
    </div>
  );
}

export default App;
