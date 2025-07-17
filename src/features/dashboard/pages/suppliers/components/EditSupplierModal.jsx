// src/features/dashboard/pages/suppliers/components/EditSupplierModal.jsx

import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";

const inputBaseStyle =
  "block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold";

const EditSupplierModal = ({ isOpen, onClose, onSave, supplierToEdit, existingNits = [] }) => {
  const initialState = {
    id: null,
    taxId: "",
    empresa: "",
    encargado: "",
    contactNumber: "",
    email: "",
    address: "",
    estado: "Activo",
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Ya no necesitamos useRef para manejar clics fuera, solo para el scroll del contenido
  // const modalContentRef = useRef(null); 
  // const mouseDownTarget = useRef(null);

  // Precargar los datos del proveedor cuando supplierToEdit cambie o el modal se abra
  useEffect(() => {
    if (isOpen && supplierToEdit) {
      setFormData({
        id: supplierToEdit.id,
        taxId: supplierToEdit.nit || "",
        empresa: supplierToEdit.empresa || "",
        encargado: supplierToEdit.encargado || "",
        contactNumber: supplierToEdit.telefono || "",
        email: supplierToEdit.correo || "",
        address: supplierToEdit.direccion || "",
        estado: supplierToEdit.estado || "Activo",
      });
      setErrors({});
      setFormSubmitted(false);
    } else if (!isOpen) {
        setFormData(initialState);
    }
  }, [isOpen, supplierToEdit]);

  // Validaciones
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "taxId":
        if (!value.trim()) {
          error = "El NIT es obligatorio.";
        } else if (!/^\d+$/.test(value)) {
          error = "El NIT debe contener solo números.";
        } else if (existingNits.includes(value) && supplierToEdit && value !== supplierToEdit.nit) {
            error = "Este NIT ya está registrado por otro proveedor.";
        }
        break;
      case "empresa":
        if (!value.trim()) {
          error = "El nombre de la empresa es obligatorio.";
        }
        break;
      case "encargado":
        if (!value.trim()) {
          error = "El nombre del encargado es obligatorio.";
        }
        break;
      case "contactNumber":
        if (value.trim() && !/^[\d\s\+\-\(\)]*$/.test(value)) {
          error = "El teléfono contiene caracteres no válidos.";
        }
        break;
      case "email":
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Ingrese un correo electrónico válido.";
        }
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formSubmitted) {
        validateField(name, value);
    } else {
        setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleKeyPressNumeric = (e) => {
    const charCode = e.charCode;
    if (charCode < 48 || charCode > 57) {
      e.preventDefault();
    }
  };

  const handleKeyPressPhone = (e) => {
    const charCode = e.charCode;
    if (
      (charCode < 48 || charCode > 57) &&
      charCode !== 43 &&
      charCode !== 45 &&
      charCode !== 40 &&
      charCode !== 41 &&
      charCode !== 32
    ) {
      e.preventDefault();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    let formIsValid = true;
    const newErrors = {};

    Object.keys(formData).forEach(name => {
      if (name !== 'id' && name !== 'estado') {
          const error = validateField(name, formData[name]);
          if (error) {
              newErrors[name] = error;
              formIsValid = false;
          }
      }
    });

    setErrors(newErrors);

    if (!formIsValid) {
      toast.error("Por favor, corrige los errores en el formulario.");
      return;
    }

    const updatedSupplier = {
      ...supplierToEdit,
      id: formData.id,
      nit: formData.taxId,
      empresa: formData.empresa,
      encargado: formData.encargado,
      telefono: formData.contactNumber,
      correo: formData.email,
      direccion: formData.address,
      estado: formData.estado,
    };

    onSave(updatedSupplier);
    toast.success("¡Proveedor actualizado exitosamente!");
    onClose();
  };

  // Eliminamos las funciones handleMouseDown y handleMouseUp

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12"
      // Eliminamos onMouseDown y onMouseUp de aquí
    >
      <div
        // Ya no necesitamos ref en este div para el clic fuera
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        {/* Encabezado fijo */}
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Editar Proveedor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2">
            <FaTimes />
          </button>
        </header>

        {/* Contenido del formulario con scroll */}
        <form
          onSubmit={handleSubmit}
          // Aplicamos el overflow-y-auto y max-height directamente al formulario
          className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-300 flex-grow" // Añadimos flex-grow para que ocupe el espacio disponible
        >
          {/* NIT y Empresa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                * NIT / Identificación Fiscal
              </label>
              <input
                id="taxId"
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPressNumeric}
                inputMode="numeric"
                className={`${inputBaseStyle} ${errors.taxId ? 'border-red-500' : ''}`}
                required
                title="Ingrese solo números"
              />
              {errors.taxId && <p className="text-red-500 text-xs mt-1">{errors.taxId}</p>}
            </div>

            <div>
              <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">
                * Nombre de la Empresa
              </label>
              <input
                id="empresa"
                type="text"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputBaseStyle} ${errors.empresa ? 'border-red-500' : ''}`}
                required
              />
              {errors.empresa && <p className="text-red-500 text-xs mt-1">{errors.empresa}</p>}
            </div>

            {/* Encargado */}
            <div>
              <label htmlFor="encargado" className="block text-sm font-medium text-gray-700 mb-1">
                * Nombre del Encargado
              </label>
              <input
                id="encargado"
                type="text"
                name="encargado"
                value={formData.encargado}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputBaseStyle} ${errors.encargado ? 'border-red-500' : ''}`}
                required
              />
              {errors.encargado && <p className="text-red-500 text-xs mt-1">{errors.encargado}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                id="contactNumber"
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPressPhone}
                className={`${inputBaseStyle} ${errors.contactNumber ? 'border-red-500' : ''}`}
                title="Ingrese un número de teléfono válido (solo números, espacios, +, - , ( , ) )"
              />
              {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
            </div>

            {/* Correo */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputBaseStyle} ${errors.email ? 'border-red-500' : ''}`}
                placeholder="ejemplo@correo.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Dirección */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                id="address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputBaseStyle}
              />
            </div>

            {/* Estado (nuevo campo editable) */}
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className={inputBaseStyle}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

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

export default EditSupplierModal;