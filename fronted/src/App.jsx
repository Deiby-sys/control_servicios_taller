//Es la primera página en ser cargada por la aplicación

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
            <Route path="/RegistroUsuario" element={<h1>HomePage</h1>}/>
            <Route path="/tasks" element={<h1>TaskPage</h1>}/>
            <Route path="/add task" element={<h1>NewTask</h1>}/>
            <Route path="/task/:id" element={<h1>UpdateTask</h1>}/>
            <Route path="/profile" element={<h1>ProfileUser</h1>}/>
            <Route path='*' element={<Notfound/>}/>
        </Routes>
    </BrowserRouter>
  );
}
