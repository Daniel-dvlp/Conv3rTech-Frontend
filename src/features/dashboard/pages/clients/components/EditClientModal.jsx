import React, { useEffect, useState } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { Switch } from '@headlessui/react';
import { showSuccess } from '../../../../../shared/utils/alerts';

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
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 sm:p-6 border-b bg-white rounded-t-xl">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Editar Cliente</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2"><FaTimes /></button>
                </header>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 custom-scroll">
                    {/* Información del cliente */}
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
                                <input type="text" name="documento" value={formData.documento} disabled className={`${inputBaseStyle} bg-gray-100 cursor-not-allowed`} />
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

                    {/* Direcciones */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Direcciones del Cliente</h3>
                        <div className="space-y-4">
                            {Array.isArray(formData.addresses) &&
                                formData.addresses.map((dir, index) => (
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
                                        {errors[`direccion-${index}`] && (
                                            <p className="col-span-full text-red-500 text-sm">{errors[`direccion-${index}`]}</p>
                                        )}
                                    </div>
                                ))}
                            <button type="button" onClick={addDireccion} className="mt-2 w-full sm:w-auto inline-flex justify-center items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-4 py-2 rounded-lg shadow-sm transition-all">
                                <FaPlus /> Agregar otra dirección
                            </button>
                        </div>
                    </div>

                    {/* Preferencias */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Preferencias</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

                    <div className="flex justify-end gap-4 pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditClientModal;