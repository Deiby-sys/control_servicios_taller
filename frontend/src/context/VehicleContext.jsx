// Contexto módulo vehículos

import { createContext, useContext, useReducer } from "react";
import { 
  getVehiclesRequest, 
  createVehicleRequest, 
  deleteVehicleRequest, 
  updateVehicleRequest 
} from "../api/vehicle.api";

const VehicleContext = createContext();

const vehicleReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_VEHICLES_START":
      return { ...state, loading: true, error: null };
    case "FETCH_VEHICLES_SUCCESS":
      return { ...state, loading: false, vehicles: action.payload, error: null };
    case "FETCH_VEHICLES_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "CREATE_VEHICLE":
      return { ...state, vehicles: [...state.vehicles, action.payload] };
    case "DELETE_VEHICLE":
      return {
        ...state,
        vehicles: state.vehicles.filter(vehicle => vehicle._id !== action.payload)
      };
    case "UPDATE_VEHICLE":
      return {
        ...state,
        vehicles: state.vehicles.map(vehicle => 
          vehicle._id === action.payload._id ? action.payload : vehicle
        )
      };
    default:
      return state;
  }
};

export function VehicleProvider({ children }) {
  const [state, dispatch] = useReducer(vehicleReducer, {
    vehicles: [],
    loading: false,
    error: null,
  });

  const getVehicles = async () => {
    dispatch({ type: "FETCH_VEHICLES_START" });
    try {
      const res = await getVehiclesRequest();
      dispatch({ type: "FETCH_VEHICLES_SUCCESS", payload: res.data });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al cargar vehículos";
      dispatch({ type: "FETCH_VEHICLES_ERROR", payload: errorMessage });
    }
  };

  const createVehicle = async (vehicleData) => {
    try {
      const res = await createVehicleRequest(vehicleData);
      dispatch({ type: "CREATE_VEHICLE", payload: res.data });
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al crear vehículo";
      throw new Error(errorMessage);
    }
  };

  const deleteVehicle = async (id) => {
    try {
      await deleteVehicleRequest(id);
      dispatch({ type: "DELETE_VEHICLE", payload: id });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al eliminar vehículo";
      throw new Error(errorMessage);
    }
  };

  const updateVehicle = async (id, vehicleData) => {
    try {
      const res = await updateVehicleRequest(id, vehicleData);
      dispatch({ type: "UPDATE_VEHICLE", payload: res.data });
      return res.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al actualizar vehículo";
      throw new Error(errorMessage);
    }
  };

  return (
    <VehicleContext.Provider value={{ ...state, getVehicles, createVehicle, deleteVehicle, updateVehicle }}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicles() {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error("useVehicles debe usarse dentro de VehicleProvider");
  }
  return context;
}