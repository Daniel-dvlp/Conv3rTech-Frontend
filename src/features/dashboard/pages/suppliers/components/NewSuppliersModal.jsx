// src/features/dashboard/pages/service_orders/components/NewProviderModal.jsx

import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const inputBaseStyle =
  "block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold";

const NewProviderModal = ({ isOpen, onClose, onSave }) => {
  const initialState = {
    taxId: "",
    empresa: "",
    encargado: "",
    contactNumber: "",
    email: "",
    address: "",
  };

  const [providerData, setProviderData] = useState(initialState);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProviderData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!providerData.taxId.trim() || !providerData.empresa.trim() || !providerData.encargado.trim()) {
      setError("Por favor complete todos los campos obligatorios (*)");
      return;
    }

    // Validación NIT solo números
    if (!/^\d+$/.test(providerData.taxId)) {
      setError("El NIT debe contener solo números.");
      return;
    }

    // Validar email básico
    if (providerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(providerData.email)) {
      setError("Ingrese un correo electrónico válido.");
      return;
    }

    // Aquí debes verificar si el NIT ya existe, ejemplo:
    // if (existeNIT(providerData.taxId)) {
    //   setError("El NIT ya está registrado.");
    //   return;
    // }

    const newProvider = {
      id: Date.now(),
      nit: providerData.taxId,
      empresa: providerData.empresa,
      encargado: providerData.encargado,
      telefono: providerData.contactNumber,
      correo: providerData.email,
      direccion: providerData.address,
      estado: "Activo",
    };

    onSave(newProvider);
    setProviderData(initialState);
    onClose();
  };

  if (!isOpen) return null;

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
          <h2 className="text-2xl font-bold text-gray-800">Registrar Nuevo Proveedor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2">
            <FaTimes />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-300"
        >
          {/* NIT y Empresa alineados */}
          <div className="flex flex-col sm:flex-row sm:gap-6">
            <div className="flex-1 flex flex-col">
              <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1 h-6">
                * NIT / Identificación Fiscal
              </label>
              <input
                id="taxId"
                type="text"
                name="taxId"
                value={providerData.taxId}
                onChange={handleChange}
                className={inputBaseStyle}
                required
                pattern="\d+"
                title="Ingrese solo números"
                style={{ height: "40px" }}
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1 h-6">
                * Nombre de la Empresa
              </label>
              <input
                id="empresa"
                type="text"
                name="empresa"
                value={providerData.empresa}
                onChange={handleChange}
                className={inputBaseStyle}
                required
                style={{ height: "40px" }}
              />
            </div>
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
              className={inputBaseStyle}
              required
            />
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
              className={inputBaseStyle}
              pattern="[\d\s\+\-]+"
              title="Ingrese un número de teléfono válido"
            />
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
              className={inputBaseStyle}
              placeholder="ejemplo@correo.com"
            />
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
              className={inputBaseStyle}
            />
          </div>

          {/* Mostrar error si hay */}
          {error && (
            <p className="text-red-600 font-semibold text-center">{error}</p>
          )}

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
