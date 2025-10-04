// Formulario para clientes  usará el esquema Zod y clases CSS

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema } from '../schemas/client.schema'; // Importamos el esquema de validación
import { useClients } from '../context/ClientContext';
import { getClientRequest } from '../api/client.api'; // Importamos la petición individual

// Opciones para el campo select (identificationType)
const idOptions = [
    { value: 'Cédula', label: 'Cédula' },
    { value: 'RUC', label: 'RUC' },
    { value: 'Pasaporte', label: 'Pasaporte' },
    { value: 'NIT', label: 'NIT' },
    { value: 'Otro', label: 'Otro' },
];

function ClientFormPage() {
    // Hooks de formularios y navegación
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(clientSchema), // Usamos Zod para la validación
    });
    
    // Funciones CRUD del contexto
    const { createClient, updateClient } = useClients();
    
    const navigate = useNavigate();
    const params = useParams(); // Para obtener el ID si estamos editando

    // Lógica para CARGAR datos si estamos en modo EDICIÓN
    useEffect(() => {
        const loadClient = async () => {
            if (params.id) {
                try {
                    const res = await getClientRequest(params.id);
                    // Rellenar el formulario con los datos del cliente
                    const data = res.data;
                    setValue('identificationType', data.identificationType);
                    setValue('identificationNumber', data.identificationNumber);
                    setValue('name', data.name);
                    setValue('lastName', data.lastName);
                    setValue('phone', data.phone);
                    setValue('city', data.city);
                    setValue('address', data.address);
                    setValue('email', data.email);
                } catch (error) {
                    console.error("Error al cargar cliente para edición:", error);
                    // Aquí podrías redirigir o mostrar un error
                }
            }
        };
        loadClient();
    }, [params.id, setValue]);


    // Función que se ejecuta al enviar el formulario
    const onSubmit = handleSubmit(async (data) => {
        try {
            if (params.id) {
                // Modo Edición
                await updateClient(params.id, data);
            } else {
                // Modo Creación
                await createClient(data);
            }
            // Redirigir a la lista de clientes después de guardar
            navigate('/clients'); 
        } catch (error) {
            console.error("Error al guardar cliente:", error.response.data);
            // Mostrar mensajes de error de API si es necesario
        }
    });
    
    // Título dinámico
    const title = params.id ? "Editar Cliente" : "Registrar Nuevo Cliente";
    const buttonText = params.id ? "Actualizar Cliente" : "Guardar Cliente";

    return (
        <div className="form-container"> {/* <-- CLASE BASE DE TU ESTILO */}
            <header>
                {/* Asumo que tienes una imagen de logo o emblema */}
                <img src="/path/to/tu/emblema.png" alt="Emblema Taller" className="emblema" /> 
                <h2>{title}</h2>
            </header>

            <form onSubmit={onSubmit}>
                {/* 1. FILA DE IDENTIFICACIÓN */}
                <label htmlFor="identificationType">Tipo de Identificación</label>
                {/* Usaremos un <select> simple para mantener la coherencia con tu CSS base */}
                <select
                    id="identificationType"
                    {...register('identificationType')}
                    // Aplicamos el estilo de input para que sea similar
                    className="form-container input" 
                >
                    <option value="">Seleccione...</option>
                    {idOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                {errors.identificationType && (<p className='text-red-500 text-sm'>{errors.identificationType.message}</p>)}


                <label htmlFor="identificationNumber">Número de Identificación</label>
                <input
                    type="text"
                    id="identificationNumber"
                    placeholder='Número de Cédula/RUC/NIT'
                    {...register('identificationNumber')}
                />
                {errors.identificationNumber && (<p className='text-red-red-500 text-sm'>{errors.identificationNumber.message}</p>)}

                {/* 2. FILA DE NOMBRE COMPLETO */}
                <label htmlFor="name">Nombre</label>
                <input
                    type="text"
                    id="name"
                    placeholder='Nombre(s) del cliente'
                    {...register('name')}
                />
                {errors.name && (<p className='text-red-500 text-sm'>{errors.name.message}</p>)}

                <label htmlFor="lastName">Apellido</label>
                <input
                    type="text"
                    id="lastName"
                    placeholder='Apellido(s) del cliente'
                    {...register('lastName')}
                />
                {errors.lastName && (<p className='text-red-500 text-sm'>{errors.lastName.message}</p>)}

                {/* 3. FILA DE CONTACTO Y UBICACIÓN */}
                <label htmlFor="phone">Teléfono de Contacto</label>
                <input
                    type="text"
                    id="phone"
                    placeholder='Ej: 3001234567'
                    {...register('phone')}
                />
                {errors.phone && (<p className='text-red-500 text-sm'>{errors.phone.message}</p>)}
                
                <label htmlFor="city">Ciudad</label>
                <input
                    type="text"
                    id="city"
                    placeholder='Ej: Bogotá'
                    {...register('city')}
                />
                {errors.city && (<p className='text-red-500 text-sm'>{errors.city.message}</p>)}

                <label htmlFor="address">Dirección (Opcional)</label>
                <input
                    type="text"
                    id="address"
                    placeholder='Dirección del domicilio'
                    {...register('address')}
                />
                {errors.address && (<p className='text-red-500 text-sm'>{errors.address.message}</p>)}
                
                <label htmlFor="email">Email (Opcional)</label>
                <input
                    type="email"
                    id="email"
                    placeholder='correo@ejemplo.com'
                    {...register('email')}
                />
                {errors.email && (<p className='text-red-500 text-sm'>{errors.email.message}</p>)}

                {/* Botón de Enviar */}
                <button type="submit" className="btn mt-4">
                    {buttonText}
                </button>
            </form>
        </div>
    );
}

export default ClientFormPage;