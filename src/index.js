//index.js se encarga de arrancar la aplicación

//import React from 'react';
//import ReactDOM from 'react-dom/client';
//import './index.css';
import app from './App.js';
import connectDB from './database.js'; //importamos acceso a base de datos

app.listen(4000)
console.log('Server on port', 4000)



/*const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
  <React.StrictMode>
    <App />
  </React.StrictMode>
);*/

//traigo dbconnect para conectar la base de datos
