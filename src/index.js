//index.js se encarga de arrancar la aplicación

import app from './App.js';
import connectDB from './database.js'; //importamos acceso a base de datos

app.listen(4000)
console.log('Server on port', 4000)

//traigo dbconnect para conectar la base de datos
