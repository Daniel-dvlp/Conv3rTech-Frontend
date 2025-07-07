import React, { useEffect, useState } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { showSuccess } from '../../../../../shared/utils/alerts';

const inputBaseStyle = "block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold";
const labelStyle = "block text-sm font-medium text-gray-700 mb-1";

const EditClientModal = ({ isOpen, onClose, clientData, onSubmit }) => {
    const [formData, setFormData] = useState({
        tipoDocumento: '',
        documento: '',
        nombre: '',
        apellido: '',
        email: '',
        celular: '',
        credito: false,
        estado: true,
        direcciones: [],
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && clientData) {
            console.log('Client Data:', clientData); // DEBUG
            setFormData({
                ...clientData,
                direcciones: clientData.direcciones ?? [],
            });
            setErrors({});
        }
        console.log("Modal abierto:", isOpen); // <--- Agrega esto para depurar
    }, [isOpen, clientData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
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

        onSubmit(formData); // ✅
        console.log("Se actualizó cliente, cerrando modal...");
        showSuccess('Cambios guardados correctamente');
        onClose();
        // onSubmit debe ser una función que maneje la actualización del cliente
       
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Editar Cliente</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2"><FaTimes /></button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-300">
                    {/* Información del cliente */}
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
                                <input type="text" name="documento" value={formData.documento} onChange={handleChange} disabled className={`${inputBaseStyle} bg-gray-100 cursor-not-allowed`} />
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

                    {/* Direcciones */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 md:p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-0 border-gray-200 pb-3">Direcciones del Cliente</h3>
                        <div className="space-y-4">
                            {Array.isArray(formData.direcciones) &&
                                formData.direcciones.map((dir, index) => (
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
                            <button type="button" onClick={addDireccion} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark px-4 py-2 rounded-lg">
                                <FaPlus /> Agregar otra dirección
                            </button>
                        </div>
                    </div>

                    {/* Preferencias */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 md:p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-0 border-gray-200 pb-3">Preferencias</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelStyle}>Crédito</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={formData.credito === true} onChange={() => setFormData(prev => ({ ...prev, credito: true }))} className="h-4 w-4 text-conv3r-gold border-gray-300 rounded" />
                                        <span className="text-sm text-gray-800">Sí</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={formData.credito === false} onChange={() => setFormData(prev => ({ ...prev, credito: false }))} className="h-4 w-4 text-conv3r-gold border-gray-300 rounded" />
                                        <span className="text-sm text-gray-800">No</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className={labelStyle}>Estado</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={formData.estado === true} onChange={() => setFormData(prev => ({ ...prev, estado: true }))} className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                                        <span className="text-sm text-gray-800">Activo</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" checked={formData.estado === false} onChange={() => setFormData(prev => ({ ...prev, estado: false }))} className="h-4 w-4 text-red-600 border-gray-300 rounded" />
                                        <span className="text-sm text-gray-800">Inactivo</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditClientModal;