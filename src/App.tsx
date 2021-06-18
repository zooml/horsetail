import { Button, Card, CardMedia, Container, Paper } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
// import { withStyles } from "@material-ui/core/styles";
import React from "react";
// import { Subject } from "rxjs";
import './App.css';
import Alerter from "./components/Alerter";
import NavBar from './components/NavBar';
// import UserCtlButton from './components/UserCtlButton';
import { GlobalCss } from "./GlobalCss";
// import { accountsLoad } from "./models/account";
// import * as alert from './models/alert';
import * as user from './models/user';
// import NestedList from './components/NestedList'
// import AccountsTree from './components/AccountsTree'
//import DocumentsTable, {data, columns} from './components/DocumentsTable';
//import VList from './components/VList'
// import DrCr from './components/DrCr'
import { Box } from "@material-ui/core"; // must be last import
import horsetail from '../public/static/images/horsetail-grass.jpg';
import PubContent from "./pubsite/PubContent";

const App = () => {
  return (
    <div className="App">
      <CssBaseline/>
      <GlobalCss />
      <NavBar/>
      {/* <UserCtlButton/> */}
      {/* <NestedList /> */}
      {/* <AccountsTree /> */}
      {/* <DocumentsTable data={data} columns={columns} /> */}
      {/* <VList/> */}
      {/* <DrCr amount={-100.23} asCr={false} /> */}
      {/* <Button onClick={() => {
        user.getIsInitSessionValid$()
          .subscribe({next: v => alert.push({
            severity: 2,
            message: `Hello, world! ${v}`,
            action: {label: 'done', onClick: () => console.log('clicked')}
          })});
      }} >ajax</Button> */}
      {/* <Button onClick={() => {
        user.get$().subscribe({
          next: u => {console.log(`got user ${u.email}`)},
          error: e => {console.log(`got error ${e.message}`)},
          complete: () => {console.log('not signed in')}
        }) 
      }} >init</Button> */}
      {/* <Card style={{width: '100%', height: '100%'}}>
        <CardMedia image="/static/images/horsetail-grass.jpg" />
        <Box>hi</Box>
      </Card> */}
      {/* <img alt="Horsetail plants background" src="/static/images/horsetail-grass.jpg"/> */}
      {/* <Container hidden={false} style={{backgroundImage: 'url(/static/img/horsetail-grass.jpg)', flex: 1, width: '100%', height: '100%'}}>
        <Box>hi</Box>
        <Box>bye</Box>
      </Container> */}
      <PubContent />
      <Alerter />
    </div>
  );
}

export default App;
