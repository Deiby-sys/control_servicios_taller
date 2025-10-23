// Formulario para clientes  usará el esquema Zod y clases CSS

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema } from '../schemas/client.schema';
import { useClients } from '../context/ClientContext';
import { getClientRequest } from '../api/client.api';

const idOptions = [
    { value: 'Cédula', label: 'Cédula' },
    { value: 'RUC', label: 'RUC' },
    { value: 'Pasaporte', label: 'Pasaporte' },
    { value: 'NIT', label: 'NIT' },
    { value: 'Otro', label: 'Otro' },
];

function ClientFormPage() {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(clientSchema),
    });
    
    const { createClient, updateClient } = useClients();
    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        const loadClient = async () => {
            if (params.id) {
                try {
                    const res = await getClientRequest(params.id);
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
                }
            }
        };
        loadClient();
    }, [params.id, setValue]);

    const onSubmit = handleSubmit(async (data) => {
        try {
            if (params.id) {
                await updateClient(params.id, data);
            } else {
                await createClient(data);
            }
            navigate('/clients'); 
        } catch (error) {
            console.error("Error al guardar cliente:", error.response?.data);
        }
    });

    // Función para cancelar y volver a la lista
    const handleCancel = () => {
        navigate('/clients');
    };

    const title = params.id ? "Editar Cliente" : "Registrar Cliente";
    const submitButtonText = params.id ? "Actualizar Cliente" : "Registrar Cliente"; // Cambiado el texto

    return (
        <div className="form-container">
            <header>
                <h1>{title}</h1>
            </header>

            <form onSubmit={onSubmit}>
                {/* 1. FILA DE IDENTIFICACIÓN */}
                <label htmlFor="identificationType">Tipo de Identificación</label>
                <select
                    id="identificationType"
                    {...register('identificationType')}
                    className="input" // Quitado "form-container" 
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
                {errors.identificationNumber && (<p className='text-red-500 text-sm'>{errors.identificationNumber.message}</p>)}

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

                {/* DOS BOTONES: Registrar/Actualizar y Cancelar */}
                <div className="form-actions"> {/* Contenedor para los botones */}
                    <button 
                        type="button" 
                        className="btn-cancel" 
                        onClick={handleCancel}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="btn"
                    >
                        {submitButtonText}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ClientFormPage;