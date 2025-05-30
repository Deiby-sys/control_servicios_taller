//con mongoose nos conectamos a la base de datos
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://deibyleandro:dama2409@cluster0.ij2sp50.mongodb.net/Control_Servicios_Taller?retryWrites=true&w=majority&appName=Cluster0', {
      //useNewUrlParser: true,
      //useUnifiedTopology: true,
    });
    console.log("Conectado a la base de datos");
  } catch (error) {
    console.log("Error de conexión:", error);
  }
}

export default connectDB();