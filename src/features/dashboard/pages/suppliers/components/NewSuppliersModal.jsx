// src/features/dashboard/pages/service_orders/components/NewProviderModal.jsx

import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";

const inputBaseStyle =
  "block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold";

const NewProviderModal = ({ isOpen, onClose, onSave, existingNits = [] }) => {
  const initialState = {
    taxId: "",
    empresa: "",
    encargado: "",
    contactNumber: "",
    email: "",
    address: "",
  };

  const [providerData, setProviderData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Eliminamos useRef para modalContentRef y mouseDownTarget ya que no se usarán para cerrar el modal al hacer clic fuera
  // const modalContentRef = useRef(null); 
  // const mouseDownTarget = useRef(null); 

  // Resetear el formulario cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setProviderData(initialState);
      setErrors({});
      setFormSubmitted(false);
    }
  }, [isOpen]); // Dependencia solo en isOpen para resetear al abrir

  // Validaciones
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "taxId":
        if (!value.trim()) {
          error = "El NIT es obligatorio.";
        } else if (!/^\d+$/.test(value)) {
          error = "El NIT debe contener solo números.";
        } else if (existingNits.includes(value)) {
          error = "Este NIT ya está registrado.";
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
    setProviderData((prev) => ({ ...prev, [name]: value }));
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

    Object.keys(providerData).forEach(name => {
      const error = validateField(name, providerData[name]);
      if (error) {
        newErrors[name] = error;
        formIsValid = false;
      }
    });

    setErrors(newErrors);

    if (!formIsValid) {
      toast.error("Por favor, corrige los errores en el formulario.");
      return;
    }

    const newProvider = {
      id: Date.now(), // Asigna un ID único, podrías usar una librería como uuid si es necesario
      nit: providerData.taxId,
      empresa: providerData.empresa,
      encargado: providerData.encargado,
      telefono: providerData.contactNumber,
      correo: providerData.email,
      direccion: providerData.address,
      estado: "Activo", // Los nuevos proveedores inician como Activos
    };

    onSave(newProvider);
    // El hook manejará el toast de éxito
    setProviderData(initialState);
    setErrors({});
    setFormSubmitted(false);
    onClose();
  };

  // Eliminamos handleMouseDown y handleMouseUp ya que no queremos cerrar al hacer clic fuera
  // y por lo tanto tampoco necesitamos las referencias 'modalContentRef' y 'mouseDownTarget'.

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12"
      // Eliminamos onMouseDown y onMouseUp de aquí
    >
      <div
        // Eliminamos ref={modalContentRef} de aquí
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        {/* Encabezado fijo */}
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Registrar Nuevo Proveedor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2">
            <FaTimes />
          </button>
        </header>

        {/* Contenido del formulario con scroll */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-300 flex-grow" // Añadimos flex-grow
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
                value={providerData.taxId}
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
                value={providerData.empresa}
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
                value={providerData.encargado}
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
                value={providerData.contactNumber}
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
                value={providerData.email}
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
                value={providerData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputBaseStyle}
              />
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
              Guardar Proveedor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProviderModal;