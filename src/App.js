import CssBaseline from "@material-ui/core/CssBaseline";
import './App.css';
import NavBar from './components/NavBar';
import AccountsTree from './components/AccountsTree';

function App() {
  return (
    <div className="App">
      <CssBaseline/>
      <NavBar/>
      <AccountsTree/>
    </div>
  );
}

export default App;
