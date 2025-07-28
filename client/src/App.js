import { Outlet } from 'react-router-dom';
import './App.css';
import NavBar from './components/Navbar';
function App() {
  return (
    <main>
      <NavBar />
      <Outlet/>
    </main>
  );
}

export default App;