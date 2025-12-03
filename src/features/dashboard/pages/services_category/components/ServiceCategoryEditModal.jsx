import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Switch } from '@headlessui/react';
import { serviceCategoryService } from '../services/serviceCategoryService';

// Componentes reutilizables del diseño estándar
const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const inputBaseStyle = 'block w-full text-sm text-gray-500 border rounded-lg shadow-sm p-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold';

const normalizeText = (text) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

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

const ServiceCategoryEditModal = ({
    isOpen,
    onClose,
    onSave,
    categoryToEdit,
    existingCategories,
}) => {
    const [categoryData, setCategoryData] = useState({
        nombre: '',
        descripcion: '',
        estado: true,
        id: null,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (categoryToEdit) {
            setCategoryData({
                nombre: categoryToEdit.nombre || '',
                descripcion: categoryToEdit.descripcion || '',
                estado: typeof categoryToEdit.estado === 'boolean' ? categoryToEdit.estado : categoryToEdit.estado === 'Activo',
                id: categoryToEdit.id,
            });
            setErrors({});
        }
    }, [categoryToEdit]);

    if (!isOpen || !categoryToEdit) return null;

    const validateField = (name, value) => {
        const newErrors = { ...errors };

        if (name === 'nombre') {
            if (!value) {
                newErrors.nombre = 'El nombre es obligatorio';
            } else if (
                existingCategories.some(
                    (cat) =>
                        normalizeText(cat.nombre) === normalizeText(value) &&
                        cat.id !== categoryToEdit.id
                )
            ) {
                newErrors.nombre = 'Ya existe otra categoría con este nombre';
            } else {
                delete newErrors.nombre;
            }
        }

        if (name === 'descripcion') {
            if (!value) {
                newErrors.descripcion = 'La descripción es obligatoria';
            } else {
                delete newErrors.descripcion;
            }
        }

        setErrors(newErrors);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategoryData((prev) => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        validateField('nombre', categoryData.nombre);
        validateField('descripcion', categoryData.descripcion);
        // Espera a que los errores se actualicen antes de continuar
        setTimeout(() => {
            if (Object.keys(errors).length === 0) {
                onSave({ ...categoryData });
                onClose();
            }
        }, 0);
    };

    const handleEstadoPatch = (id, nuevoEstado) => {
        fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado }),
        })
            .then(res => res.json())
            .then(() => {
                setCategoryData((prev) => ({
                    ...prev,
                    estado: nuevoEstado,
                }));
            })
            .catch(() => {
                // Opcional: mostrar error
                setCategoryData((prev) => ({
                    ...prev,
                    estado: !nuevoEstado, // Revierte el cambio si falla
                }));
            });
    };


    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Editar Categoría</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 text-2xl p-2"
                    >
                        <FaTimes />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 custom-scroll flex-grow">
                    <FormSection title="Información de la Categoría">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <FormLabel htmlFor="nombre">
                                    <span className="text-red-500">*</span> Nombre
                                </FormLabel>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    type="text"
                                    value={categoryData.nombre}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`${inputBaseStyle} ${errors.nombre ? 'border-red-500' : ''}`}
                                />
                                {errors.nombre && (
                                    <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                                )}
                            </div>

                            <div>
                                <FormLabel htmlFor="descripcion">
                                    <span className="text-red-500">*</span> Descripción
                                </FormLabel>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={categoryData.descripcion}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    rows="4"
                                    className={`${inputBaseStyle} resize-none ${errors.descripcion ? 'border-red-500' : ''}`}
                                ></textarea>
                                {errors.descripcion && (
                                    <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
                                )}
                            </div>
                        </div>
                    </FormSection>

                    <FormSection title="Estado">
                        <div className="flex items-center gap-4">
                            <FormLabel>Estado:</FormLabel>
                            <ToggleSwitch
                                checked={categoryData.estado}
                                onChange={() => {
                                    const nuevoEstado = !categoryData.estado;
                                    handleEstadoPatch(categoryData.id, nuevoEstado);
                                }}
                            />
                        </div>
                    </FormSection>

                    <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceCategoryEditModal;
