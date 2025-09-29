import React, { useEffect, useState } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { showSuccess } from '../../../../../shared/utils/alerts';

const inputBaseStyle = "block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold";
const labelStyle = "block text-sm font-medium text-gray-700 mb-1";

const EditClientModal = ({ isOpen, onClose, clientData, onSubmit }) => {
    const [formData, setFormData] = useState({
        tipo_documento: '',
        documento: '',
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        credito: false,
        estado_cliente: true,
        addresses: [],
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen && clientData) {
            console.log('Client Data:', clientData); // DEBUG
            setFormData({
                tipo_documento: clientData.tipo_documento || '',
                documento: clientData.documento || '',
                nombre: clientData.nombre || '',
                apellido: clientData.apellido || '',
                correo: clientData.correo || '',
                telefono: clientData.telefono || '',
                credito: clientData.credito || false,
                estado_cliente: clientData.estado_cliente ?? true,
                addresses: clientData.AddressClients || [],
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.tipo_documento) newErrors.tipo_documento = "Selecciona un tipo de documento";
        if (!formData.documento) newErrors.documento = "El documento es obligatorio";
        if (!formData.nombre) newErrors.nombre = "El nombre es obligatorio";
        if (!formData.correo) newErrors.correo = "El correo es obligatorio";
        if (!formData.telefono) newErrors.telefono = "El teléfono es obligatorio";

        formData.addresses.forEach((dir, i) => {
            if (!dir.nombre_direccion || !dir.direccion || !dir.ciudad) {
                newErrors[`direccion-${i}`] = "Todos los campos de dirección son obligatorios";
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

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
        
        onSubmit(clientDataForApi);
        console.log("Se actualizó cliente, cerrando modal...");
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
                                <input type="email" name="correo" value={formData.correo} onChange={handleChange} className={inputBaseStyle} />
                                {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo}</p>}
                            </div>

                            <div>
                                <label className={labelStyle}>Celular</label>
                                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className={inputBaseStyle} />
                                {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Direcciones */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 md:p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-0 border-gray-200 pb-3">Direcciones del Cliente</h3>
                        <div className="space-y-4">
                            {Array.isArray(formData.addresses) &&
                                formData.addresses.map((dir, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr,1fr,1fr,auto] gap-4 items-end">
                                        <div>
                                            <label className={labelStyle}>Nombre</label>
                                            <input type="text" name="nombre_direccion" value={dir.nombre_direccion} onChange={(e) => handleDireccionChange(index, e)} className={inputBaseStyle} />
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