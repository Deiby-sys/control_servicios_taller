//Es la primera página en ser cargada por la aplicación

/*import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import RegistroUsuario from './pages/RegistroUsuario';
import Notfound from './pages/Notfound';*/

import express from 'express';
import morgan from 'morgan';
const app = express();

app.use(morgan('dev'));

export default app;

/*export default function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/RegistroUsuario" element={<RegistroUsuario/>}/>
            <Route path='*' element={<Notfound/>}/>
        </Routes>
    </BrowserRouter>
  );
}*/
