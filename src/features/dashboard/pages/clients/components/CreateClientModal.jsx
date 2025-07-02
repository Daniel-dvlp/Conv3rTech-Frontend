import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaBullseye } from 'react-icons/fa';

const inputBaseStyle = "block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold";
const labelStyle = "block text-sm font-medium text-gray-700 mb-1";

const CreateClientModal = ({ isOpen, onClose, onSubmit, clientesExistentes = [] }) => {

    const initialState = {
        tipoDocumento: '',
        documento: '',
        nombre: '',
        apellido: '',
        email: '',
        celular: '',
        credito: false,
        estado: true,
        direcciones: [
            { nombre: '', direccion: '', ciudad: '' }
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

            if (name === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                const existeCorreo = clientesExistentes.some(
                    (c) =>
                        typeof c.email === 'string' &&
                        c.email.toLowerCase() === value.toLowerCase()
                );

                if (!emailRegex.test(value)) {
                    updatedErrors.email = 'El formato del correo no es válido';
                } else if (existeCorreo) {
                    updatedErrors.email = 'Este correo ya está registrado';
                } else {
                    updatedErrors.email = '';
                }

            }
            if (name === 'celular') {
                const celularRegex = /^\+?[0-9]{10,13}$/;

                if (!value) {
                    updatedErrors.celular = 'El celular es obligatorio';
                } else if (!celularRegex.test(value)) {
                    updatedErrors.celular = 'Solo se permiten números';
                } else if (value.length < 10 || value.length > 13) {
                    updatedErrors.celular = 'Debe tener entre 10 y 13 dígitos';
                } else {
                    updatedErrors.celular = '';
                }
            }


            return updatedErrors;
        });
    };


    const handleDireccionChange = (index, e) => {
        const { name, value } = e.target;
        const updated = [...formData.direcciones];
        updated[index][name] = value;
        setFormData(prev => ({ ...prev, direcciones: updated }));
    };

    const addDireccion = () => {
        setFormData(prev => ({
            ...prev,
            direcciones: [...prev.direcciones, { nombre: '', direccion: '', ciudad: '' }]
        }));
    };

    const removeDireccion = (index) => {
        const updated = [...formData.direcciones];
        updated.splice(index, 1);
        setFormData(prev => ({ ...prev, direcciones: updated }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        const celularRegex = /^\+?[0-9]{10,13}$/;
        if (!formData.celular) {
            newErrors.celular = 'El celular es obligatorio';
        } else if (!celularRegex.test(formData.celular)) {
            newErrors.celular = 'Solo se permiten números';
        } else if (formData.celular.length < 10 || formData.celular.length > 13) {
            newErrors.celular = 'Debe tener entre 10 y 13 dígitos';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'El formato del correo no es válido';
        } else {
            const existeCorreo = clientesExistentes.some(
                (c) =>
                    typeof c.email === 'string' &&
                    c.email.toLowerCase() === formData.email.toLowerCase()
            );
            if (existeCorreo) {
                newErrors.email = 'Ya existe un cliente con este correo';
            }
        }

        if (!formData.tipoDocumento) newErrors.tipoDocumento = "Selecciona un tipo de documento";
        if (!formData.documento) newErrors.documento = "El documento es obligatorio";
        if (!formData.nombre) newErrors.nombre = "El nombre es obligatorio";
        if (!formData.email) newErrors.email = "El correo es obligatorio";
        if (!formData.celular) newErrors.celular = "El celular es obligatorio";

        formData.direcciones.forEach((dir, i) => {
            if (!dir.nombre || !dir.direccion || !dir.ciudad) {
                newErrors[`direccion-${i}`] = "Todos los campos de dirección son obligatorios";
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        onSubmit(formData);
        setFormData(initialState);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Crear Cliente</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2"><FaTimes /></button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-300">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 md:p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-0 border-gray-200 pb-3">Información del Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>Tipo de Documento</label>
                                <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} className={inputBaseStyle}>
                                    <option value="">Seleccionar...</option>
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="TI">Tarjeta de Identidad</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                    <option value="NIT">NIT</option>
                                </select>
                                {errors.tipoDocumento && <p className="text-red-500 text-sm mt-1">{errors.tipoDocumento}</p>}
                            </div>

                            <div>
                                <label className={labelStyle}>Documento</label>
                                <input type="text" name="documento" value={formData.documento} onChange={handleChange} className={inputBaseStyle} />
                                {errors.documento && <p className="text-red-500 text-sm mt-1">{errors.documento}</p>}
                            </div>

                            <div>
                                <label className={labelStyle}>Nombre</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className={inputBaseStyle} />
                                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                            </div>

                            <div>
                                <label className={labelStyle}>Apellido (opcional)</label>
                                <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} className={inputBaseStyle} />
                            </div>

                            <div>
                                <label className={labelStyle}>Correo</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputBaseStyle} />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className={labelStyle}>Celular</label>
                                <input type="text" name="celular" value={formData.celular} onChange={handleChange} className={inputBaseStyle} />
                                {errors.celular && <p className="text-red-500 text-sm mt-1">{errors.celular}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 md:p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-0 border-gray-200 pb-3">Direcciones del Cliente</h3>
                        <div className="space-y-4">
                            {formData.direcciones.map((dir, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr,1fr,1fr,auto] gap-4 items-end">
                                    <div>
                                        <label className={labelStyle}>Nombre</label>
                                        <input type="text" name="nombre" value={dir.nombre} onChange={(e) => handleDireccionChange(index, e)} className={inputBaseStyle} />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Dirección</label>
                                        <input type="text" name="direccion" value={dir.direccion} onChange={(e) => handleDireccionChange(index, e)} className={inputBaseStyle} />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Ciudad</label>
                                        <input type="text" name="ciudad" value={dir.ciudad} onChange={(e) => handleDireccionChange(index, e)} className={inputBaseStyle} />
                                    </div>
                                    <div className="text-right">
                                        <button type="button" onClick={() => removeDireccion(index)} className="p-2 mt-1 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full"><FaTrash /></button>
                                    </div>
                                    {errors[`direccion-${index}`] && (
                                        <p className="col-span-full text-red-500 text-sm">{errors[`direccion-${index}`]}</p>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addDireccion} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 transition-colors">
                                <FaPlus /> Agregar otra dirección
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 md:p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-0 border-gray-200 pb-3">Preferencias</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.estado === true}
                                            onChange={() => setFormData((prev) => ({ ...prev, estado: true }))}
                                            className="h-4 w-4 text-green-600 border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-800">Activo</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.estado === false}
                                            onChange={() => setFormData((prev) => ({ ...prev, estado: false }))}
                                            className="h-4 w-4 text-red-600 border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-800">Inactivo</span>
                                    </label>
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
