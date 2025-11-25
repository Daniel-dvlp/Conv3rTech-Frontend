// src/features/dashboard/pages/service_orders/components/NewProviderModal.jsx

import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

const inputBaseStyle = 'block w-full text-sm text-gray-500 border rounded-lg shadow-sm p-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold';

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

const initialState = {
  nit: "",
  empresa: "",
  encargado: "",
  telefono_entidad: "",
  telefono_encargado: "",
  correo_principal: "",
  correo_secundario: "",
  direccion: "",
  observaciones: "",
};

const NewProviderModal = ({ isOpen, onClose, onSave, existingNits = [] }) => {

  const [providerData, setProviderData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const formRef = useRef(null);

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
      case "nit":
        if (value.trim() && !/^[a-zA-Z0-9]+$/.test(value)) {
          error = "El NIT debe ser alfanumérico.";
        } else if (existingNits.includes(value)) {
          error = "Este NIT ya está registrado.";
        }
        break;
      case "empresa":
        if (!value.trim()) {
          error = "El nombre de la entidad es obligatorio.";
        }
        break;
      case "encargado":
        if (!value.trim()) {
          error = "El nombre del encargado es obligatorio.";
        }
        break;
      case "telefono_entidad":
        if (!value.trim()) {
          error = "El teléfono de la entidad es obligatorio.";
        } else if (!/^[0-9+\-\s()]+$/.test(value)) {
          error = "El teléfono de la entidad contiene caracteres no válidos.";
        }
        break;
      case "telefono_encargado":
        if (value.trim() && !/^[0-9+\-\s()]+$/.test(value)) {
          error = "El teléfono del encargado contiene caracteres no válidos.";
        }
        break;
      case "correo_principal":
        if (!value.trim()) {
          error = "El correo principal es obligatorio.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Ingrese un correo electrónico válido.";
        }
        break;
      case "correo_secundario":
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

    // Validate required fields
    const requiredFields = ['empresa', 'encargado', 'correo_principal'];
    requiredFields.forEach(field => {
      const error = validateField(field, providerData[field]);
      if (error) {
        newErrors[field] = error;
        formIsValid = false;
      }
    });

    // Validate optional fields
    const optionalFields = ['nit', 'telefono_entidad', 'telefono_encargado', 'correo_secundario'];
    optionalFields.forEach(field => {
      if (providerData[field].trim()) {
        const error = validateField(field, providerData[field]);
        if (error) {
          newErrors[field] = error;
          formIsValid = false;
        }
      }
    });

    setErrors(newErrors);

    if (!formIsValid) {
      // Scroll to first error
      setTimeout(() => {
        const firstError = formRef.current?.querySelector('.text-red-500');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    const newProvider = {
      nit: providerData.nit,
      empresa: providerData.empresa,
      encargado: providerData.encargado,
      telefono_entidad: providerData.telefono_entidad,
      telefono_encargado: providerData.telefono_encargado,
      correo_principal: providerData.correo_principal,
      correo_secundario: providerData.correo_secundario,
      direccion: providerData.direccion,
      estado: "Activo", // Los nuevos proveedores inician como Activos
      observaciones: providerData.observaciones,
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
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-300 flex-grow" // Añadimos flex-grow
        >
          <FormSection title="Información Entidad">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <FormLabel htmlFor="empresa">
                  <span className="text-red-500">*</span> Nombre Entidad
                </FormLabel>
                <input
                  id="empresa"
                  type="text"
                  name="empresa"
                  value={providerData.empresa}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputBaseStyle} ${errors.empresa ? 'border-red-500' : ''}`}
                  required
                  maxLength="150"
                />
                {errors.empresa && <p className="text-red-500 text-xs mt-1">{errors.empresa}</p>}
              </div>

              <div>
                <FormLabel htmlFor="nit">
                  NIT
                </FormLabel>
                <input
                  id="nit"
                  type="text"
                  name="nit"
                  value={providerData.nit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputBaseStyle} ${errors.nit ? 'border-red-500' : ''}`}
                  maxLength="30"
                />
                {errors.nit && <p className="text-red-500 text-xs mt-1">{errors.nit}</p>}
              </div>

              <div className="sm:col-span-2">
                <FormLabel htmlFor="telefono_entidad">
                  Teléfono Entidad
                </FormLabel>
                <input
                  id="telefono_entidad"
                  type="tel"
                  name="telefono_entidad"
                  value={providerData.telefono_entidad}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyPress={handleKeyPressPhone}
                  className={`${inputBaseStyle} ${errors.telefono_entidad ? 'border-red-500' : ''}`}
                  required
                  title="Ingrese un número de teléfono válido (solo números, espacios, +, - , ( , ) )"
                  maxLength="20"
                />
                {errors.telefono_entidad && <p className="text-red-500 text-xs mt-1">{errors.telefono_entidad}</p>}
              </div>
            </div>
          </FormSection>

          <FormSection title="Información Encargado">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <FormLabel htmlFor="encargado">
                  <span className="text-red-500">*</span> Nombre Encargado
                </FormLabel>
                <input
                  id="encargado"
                  type="text"
                  name="encargado"
                  value={providerData.encargado}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputBaseStyle} ${errors.encargado ? 'border-red-500' : ''}`}
                  required
                  maxLength="150"
                />
                {errors.encargado && <p className="text-red-500 text-xs mt-1">{errors.encargado}</p>}
              </div>

              <div>
                <FormLabel htmlFor="telefono_encargado">
                  Teléfono Encargado
                </FormLabel>
                <input
                  id="telefono_encargado"
                  type="tel"
                  name="telefono_encargado"
                  value={providerData.telefono_encargado}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyPress={handleKeyPressPhone}
                  className={`${inputBaseStyle} ${errors.telefono_encargado ? 'border-red-500' : ''}`}
                  title="Ingrese un número de teléfono válido (solo números, espacios, +, - , ( , ) )"
                  maxLength="20"
                />
                {errors.telefono_encargado && <p className="text-red-500 text-xs mt-1">{errors.telefono_encargado}</p>}
              </div>

              <div>
                <FormLabel htmlFor="correo_principal">
                  <span className="text-red-500">*</span> Correo Principal
                </FormLabel>
                <input
                  id="correo_principal"
                  type="email"
                  name="correo_principal"
                  value={providerData.correo_principal}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputBaseStyle} ${errors.correo_principal ? 'border-red-500' : ''}`}
                  required
                  placeholder="ejemplo@correo.com"
                  maxLength="150"
                />
                {errors.correo_principal && <p className="text-red-500 text-xs mt-1">{errors.correo_principal}</p>}
              </div>

              <div>
                <FormLabel htmlFor="correo_secundario">
                  Correo Secundario
                </FormLabel>
                <input
                  id="correo_secundario"
                  type="email"
                  name="correo_secundario"
                  value={providerData.correo_secundario}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputBaseStyle} ${errors.correo_secundario ? 'border-red-500' : ''}`}
                  placeholder="ejemplo@correo.com"
                  maxLength="150"
                />
                {errors.correo_secundario && <p className="text-red-500 text-xs mt-1">{errors.correo_secundario}</p>}
              </div>
            </div>
          </FormSection>

          <FormSection title="Información General">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="sm:col-span-2">
                <FormLabel htmlFor="direccion">
                  Dirección
                </FormLabel>
                <input
                  id="direccion"
                  type="text"
                  name="direccion"
                  value={providerData.direccion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputBaseStyle}
                  maxLength="200"
                />
              </div>

              <div className="sm:col-span-2">
                <FormLabel htmlFor="observaciones">
                  Observaciones
                </FormLabel>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  value={providerData.observaciones}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputBaseStyle} resize-none`}
                  rows="3"
                  maxLength="500"
                />
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
              Guardar Proveedor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProviderModal;