import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Switch } from '@headlessui/react';

const inputBaseStyle =
    "block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold";

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

const ProductCategoryEditModal = ({
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
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (categoryToEdit) {
            setCategoryData(categoryToEdit);
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
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        validateField('nombre', categoryData.nombre);
        validateField('descripcion', categoryData.descripcion);
        if (Object.keys(errors).length > 0) return;
        onSave({ ...categoryData });
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-20"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Editar Categoría</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 text-xl p-2"
                    >
                        <FaTimes />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label
                            htmlFor="nombre"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            * Nombre:
                        </label>
                        <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            value={categoryData.nombre}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={inputBaseStyle}
                        />
                        {errors.nombre && (
                            <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="descripcion"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            * Descripción:
                        </label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={categoryData.descripcion}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            rows="4"
                            className={inputBaseStyle}
                        ></textarea>
                        {errors.descripcion && (
                            <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Estado:</label>
                        <ToggleSwitch
                            checked={categoryData.estado}
                            onChange={() =>
                                setCategoryData((prev) => ({
                                    ...prev,
                                    estado: !prev.estado,
                                }))
                            }
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
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
                            Guardar cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductCategoryEditModal;
