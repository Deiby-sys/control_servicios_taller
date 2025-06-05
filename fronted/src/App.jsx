//Es la primera página en ser cargada por la aplicación

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import RegisterUser from './pages/registerUser';


function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/registerUser" element={<RegisterUser/>}/>
            <Route path="/ppage" element={<h1>HomePage</h1>}/>
            <Route path="/tasks" element={<h1>TaskPage</h1>}/>
            <Route path="/add task" element={<h1>NewTask</h1>}/>
            <Route path="/task/:id" element={<h1>UpdateTask</h1>}/>
            <Route path="/profile" element={<h1>ProfileUser</h1>}/>
            <Route path='*' element={<NotFound/>}/>
        </Routes>
    </BrowserRouter>
  );
}
export default App;