//Vamos a crear las funciones para las tasks
import Task from '../models/taskModel.js'; //importamos el modelo de tareas


export const getTasks = async (req, res) => {
    const tasks = await Task.find({
        user: req.user.id
    }).populate('user'); //.populate traerá a pantalla los datos del usuario a quien se le generó la tarea
    res.json(tasks);
};

export const createTask = async (req, res) => {
    const {title, description, date} = req.body;
    const newTask = new Task({
        title,
        description,
        date,
        user: req.user.id
    });
    const savedTask = await newTask.save();
    res.json(savedTask);
};

export const getTask = async (req, res) => {
    const task = await Task.findById(req.params.id).populate('user'); //.populate traerá a pantalla los datos del usuario a quien se le generó la tarea
    if(!task) return res.status(404).json({message: "Task not found"});
    res.json(task);
};

export const updateTask = async (req, res) => {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    });
    if(!task) return res.status(404).json({message: "Task not found"});
    res.json(task);
};

export const deleteTask = async (req, res) => {
    const task = await Task.findByIdAndDelete(req.params.id);
    if(!task) return res.status(404).json({message: "Task not found"});
    return res.sendStatus(204);
};

