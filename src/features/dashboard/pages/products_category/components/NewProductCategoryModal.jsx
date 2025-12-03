import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

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
  (text ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const NewCategoryModal = ({ isOpen, onClose, onSave, existingCategories }) => {
  const initialState = {
    nombre: '',
    descripcion: '',
    estado: true,
  };

  const [categoryData, setCategoryData] = useState(initialState);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    if (name === "nombre") {
      if (!value) {
        newErrors.nombre = "El nombre es obligatorio";
      } else if (
        existingCategories.some(cat => normalizeText(cat.nombre) === normalizeText(value))
      ) {
        newErrors.nombre = "Ya existe una categoría con este nombre";
      } else {
        delete newErrors.nombre;
      }
    }

    if (name === "descripcion") {
      if (!value) {
        newErrors.descripcion = "La descripción es obligatoria";
      } else {
        delete newErrors.descripcion;
      }
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // ...existing code...
const handleSubmit = (e) => {
  e.preventDefault();

  // Validación sincrónica y determinística
  const newErrors = {};

  if (!categoryData.nombre) {
    newErrors.nombre = "El nombre es obligatorio";
  } else if (
    Array.isArray(existingCategories) &&
    existingCategories.some(cat => normalizeText(cat?.nombre) === normalizeText(categoryData.nombre))
  ) {
    newErrors.nombre = "Ya existe una categoría con este nombre";
  }

  if (!categoryData.descripcion) {
    newErrors.descripcion = "La descripción es obligatoria";
  }

  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) return;

  // Solo envía nombre y descripcion
  onSave({
    nombre: categoryData.nombre,
    descripcion: categoryData.descripcion,
  });

  setCategoryData(initialState);
  setErrors({});
  onClose();
};
// ...existing code...

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Crear categoría</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2">
            <FaTimes />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 custom-scroll flex-grow">
          <FormSection>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <FormLabel htmlFor="nombre">
                  <span className="text-red-500">*</span> Nombre:
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
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <FormLabel htmlFor="descripcion">
                  <span className="text-red-500">*</span> Descripción:
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
                {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
              </div>
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCategoryModal;
