import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaBullseye } from 'react-icons/fa';
import { Switch } from '@headlessui/react';

const inputBaseStyle = "block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold";
const labelStyle = "block text-sm font-medium text-gray-700 mb-1";

const ToggleSwitch = ({ checked, onChange }) => (
    <Switch
        checked={checked}
        onChange={onChange}
        className={`${checked ? 'bg-green-500' : 'bg-gray-300'}
    relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 focus:outline-none`}
    >
        <span
            className={`${checked ? 'translate-x-5' : 'translate-x-1'}
        inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300`}
        />
    </Switch>
);

const CreateClientModal = ({ isOpen, onClose, onSubmit, clientesExistentes = [] }) => {

    const initialState = {
        tipo_documento: '',
        documento: '',
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        credito: false,
        estado_cliente: true,
        addresses: [
            { nombre_direccion: '', direccion: '', ciudad: '' }
        ]
    };

    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (isOpen) {
            setFormData(initialState);
            setErrors({});
        }
    }, [isOpen]);

    // Simulación de clientes existentes para validación == Validacion en vivo
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        setErrors(prev => {
            const updatedErrors = { ...prev };

            // Elimina error si el campo ya no está vacío
            if (value) updatedErrors[name] = '';

            // Validación en vivo para duplicados (solo en email o documento)
            if (name === 'documento') {
                const existeDocumento = clientesExistentes.some(
                    (c) => c.documento.toLowerCase() === value.toLowerCase()
                );
                updatedErrors.documento = existeDocumento ? 'Este documento ya está registrado' : '';
            }

            if (name === 'correo') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                const existeCorreo = clientesExistentes.some(
                    (c) =>
                        typeof c.email === 'string' &&
                        c.email.toLowerCase() === value.toLowerCase()
                );

                if (!emailRegex.test(value)) {
                    updatedErrors.correo = 'El formato del correo no es válido';
                } else if (existeCorreo) {
                    updatedErrors.correo = 'Este correo ya está registrado';
                } else {
                    updatedErrors.correo = '';
                }

            }
            if (name === 'telefono') {
                const celularRegex = /^\+?[0-9]{10,13}$/;

                if (!value) {
                    updatedErrors.telefono = 'El teléfono es obligatorio';
                } else if (!celularRegex.test(value)) {
                    updatedErrors.telefono = 'Solo se permiten números';
                } else if (value.length < 10 || value.length > 13) {
                    updatedErrors.telefono = 'Debe tener entre 10 y 13 dígitos';
                } else {
                    updatedErrors.telefono = '';
                }
            }


            return updatedErrors;
        });
    };


    const handleDireccionChange = (index, e) => {
        const { name, value } = e.target;
        const updated = [...formData.addresses];
        updated[index][name] = value;
        setFormData(prev => ({ ...prev, addresses: updated }));
    };

    const addDireccion = () => {
        setFormData(prev => ({
            ...prev,
            addresses: [...prev.addresses, { nombre_direccion: '', direccion: '', ciudad: '' }]
        }));
    };

    const removeDireccion = (index) => {
        const updated = [...formData.addresses];
        updated.splice(index, 1);
        setFormData(prev => ({ ...prev, addresses: updated }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        const telefonoRegex = /^\+?[0-9]{10,13}$/;
        if (!formData.telefono) {
            newErrors.telefono = 'El teléfono es obligatorio';
        } else if (!telefonoRegex.test(formData.telefono)) {
            newErrors.telefono = 'Solo se permiten números';
        } else if (formData.telefono.length < 10 || formData.telefono.length > 13) {
            newErrors.telefono = 'Debe tener entre 10 y 13 dígitos';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.correo)) {
            newErrors.correo = 'El formato del correo no es válido';
        } else {
            const existeCorreo = clientesExistentes.some(
                (c) =>
                    typeof c.email === 'string' &&
                    c.email.toLowerCase() === formData.correo.toLowerCase()
            );
            if (existeCorreo) {
                newErrors.correo = 'Ya existe un cliente con este correo';
            }
        }

        if (!formData.tipo_documento) newErrors.tipo_documento = "Selecciona un tipo de documento";
        if (!formData.documento) newErrors.documento = "El documento es obligatorio";
        if (!formData.nombre) newErrors.nombre = "El nombre es obligatorio";
        if (!formData.correo) newErrors.correo = "El correo es obligatorio";
        if (!formData.telefono) newErrors.telefono = "El teléfono es obligatorio";

        formData.addresses.forEach((dir, i) => {
            if (!dir.nombre_direccion || !dir.direccion || !dir.ciudad) {
                newErrors[`address-${i}`] = "Todos los campos de dirección son obligatorios";
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        
        // Transformar los datos al formato que espera la API
        const clientDataForApi = {
            documento: formData.documento,
            tipo_documento: formData.tipo_documento,
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono,
            correo: formData.correo,
            credito: formData.credito,
            estado_cliente: formData.estado_cliente,
            addresses: formData.addresses.filter(addr => 
                addr.nombre_direccion && addr.direccion && addr.ciudad
            )
        };
        
        try {
            await onSubmit(clientDataForApi);
            setFormData(initialState);
            onClose();
        } catch (error) {
            console.error("Error al crear cliente:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 sm:p-6 border-b bg-white rounded-t-xl">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Crear Cliente</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2"><FaTimes /></button>
                </header>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 custom-scroll">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Información del Cliente</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>
                                    <span className="text-red-500">*</span> Tipo de Documento
                                </label>
                                <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange} className={inputBaseStyle}>
                                    <option value="">Seleccionar...</option>
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="TI">Tarjeta de Identidad</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                    <option value="NIT">NIT</option>
                                </select>
                                {errors.tipo_documento && <p className="text-red-500 text-sm mt-1">{errors.tipo_documento}</p>}
                            </div>

                            <div>
                                <label className={labelStyle}>
                                    <span className="text-red-500">*</span> Documento
                                </label>
                                <input type="text" name="documento" value={formData.documento} onChange={handleChange} className={inputBaseStyle} />
                                {errors.documento && <p className="text-red-500 text-sm mt-1">{errors.documento}</p>}
                            </div>

                            <div>
                                <label className={labelStyle}>
                                    <span className="text-red-500">*</span> Nombre
                                </label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className={inputBaseStyle} />
                                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                            </div>

                            <div>
                                <label className={labelStyle}>Apellido (opcional)</label>
                                <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} className={inputBaseStyle} />
                            </div>

                            <div>
                                <label className={labelStyle}>
                                    <span className="text-red-500">*</span> Correo
                                </label>
                                <input type="email" name="correo" value={formData.correo} onChange={handleChange} className={inputBaseStyle} />
                                {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo}</p>}
                            </div>

                            <div>
                                <label className={labelStyle}>
                                    <span className="text-red-500">*</span> Celular
                                </label>
                                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className={inputBaseStyle} />
                                {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Direcciones del Cliente</h3>
                        <div className="space-y-4">
                            {formData.addresses.map((dir, index) => (
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <div>
                                        <label className={labelStyle}>
                                            <span className="text-red-500">*</span> Nombre
                                        </label>
                                        <input type="text" name="nombre_direccion" value={dir.nombre_direccion} onChange={(e) => handleDireccionChange(index, e)} className={inputBaseStyle} placeholder="Ej: Casa" />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>
                                            <span className="text-red-500">*</span> Dirección
                                        </label>
                                        <input type="text" name="direccion" value={dir.direccion} onChange={(e) => handleDireccionChange(index, e)} className={inputBaseStyle} placeholder="Calle 123..." />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>
                                            <span className="text-red-500">*</span> Ciudad
                                        </label>
                                        <input type="text" name="ciudad" value={dir.ciudad} onChange={(e) => handleDireccionChange(index, e)} className={inputBaseStyle} placeholder="Bogotá" />
                                    </div>
                                    <div className="text-right sm:text-center">
                                        <button type="button" onClick={() => removeDireccion(index)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"><FaTrash /></button>
                                    </div>
                                    {errors[`address-${index}`] && (
                                        <p className="col-span-full text-red-500 text-sm">{errors[`address-${index}`]}</p>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addDireccion} className="mt-2 w-full sm:w-auto inline-flex justify-center items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-4 py-2 rounded-lg shadow-sm transition-all">
                                <FaPlus /> Agregar otra dirección
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Preferencias</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className={labelStyle}>Crédito</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.credito === true}
                                            onChange={() => setFormData((prev) => ({ ...prev, credito: true }))}
                                            className="h-4 w-4 text-conv3r-gold border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-800">Sí</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.credito === false}
                                            onChange={() => setFormData((prev) => ({ ...prev, credito: false }))}
                                            className="h-4 w-4 text-conv3r-gold border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-800">No</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className={labelStyle}>Estado</label>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-700 font-medium">
                                        {formData.estado_cliente ? 'Activo' : 'Inactivo'}
                                    </span>
                                    <ToggleSwitch
                                        checked={formData.estado_cliente}
                                        onChange={() => setFormData(prev => ({ ...prev, estado_cliente: !prev.estado_cliente }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105">Guardar Cliente</button>
                    </div>
                </form>
            </div>
        </div>
    );

};

export default CreateClientModal;
