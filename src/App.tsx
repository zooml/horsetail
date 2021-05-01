import CssBaseline from "@material-ui/core/CssBaseline";
import './App.css';
import NavBar from './components/NavBar';
//import DocumentsTable, {data, columns} from './components/DocumentsTable';
//import VList from './components/VList'
import DrCr from './components/DrCr'

function App() {
  return (
    <div className="App">
      <CssBaseline/>
      <NavBar/>
      {/* <DocumentsTable data={data} columns={columns} /> */}
      {/* <VList/> */}
      <DrCr amount={-100.23} asCr={false} />
    </div>
  );
}

export default App;
