import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import RegistroUsuario from './pages/RegistroUsuario';
import Notfound from './pages/Notfound';

export default function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/RegistroUsuario" element={<RegistroUsuario/>}/>
            <Route path='*' element={<Notfound/>}/>
        </Routes>
    </BrowserRouter>
  );
}


