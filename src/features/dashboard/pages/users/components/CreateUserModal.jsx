// src/features/dashboard/pages/users/components/CreateUserModal.jsx

import React, { useState } from 'react';

const CreateUserModal = ({ isOpen, onClose, roles, onSubmit }) => {
  const [formData, setFormData] = useState({
    tipoDocumento: '',
    documento: '',
    nombre: '',
    apellido: '',
    celular: '',
    rol: '',
    correo: '',
    contrasena: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold text-center mb-4">Crear Usuario</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Tipo de Documento:</label>
            <select name="tipoDocumento" onChange={handleChange} className="w-full border rounded p-1">
              <option value="">Seleccionar...</option>
              <option value="CC">CC</option>
              <option value="TI">TI</option>
              <option value="CE">CE</option>
            </select>
          </div>

          <input name="documento" placeholder="Documento" onChange={handleChange} className="w-full border rounded p-1" />
          <input name="nombre" placeholder="Nombre" onChange={handleChange} className="w-full border rounded p-1" />
          <input name="apellido" placeholder="Apellido" onChange={handleChange} className="w-full border rounded p-1" />
          <input name="celular" placeholder="Celular" onChange={handleChange} className="w-full border rounded p-1" />

          <div>
            <label className="block text-sm font-medium">Rol:</label>
            <select name="rol" onChange={handleChange} className="w-full border rounded p-1">
              <option value="">Seleccionar...</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.name}>{rol.name}</option>
              ))}
            </select>
          </div>

          <input name="correo" placeholder="Correo" onChange={handleChange} className="w-full border rounded p-1" />
          <input name="contrasena" type="password" placeholder="Contraseña" onChange={handleChange} className="w-full border rounded p-1" />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">Cancelar</button>
            <button type="submit" onclick={onSubmit} className="px-4 py-2 bg-conv3r-gold text-white rounded hover:brightness-95">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
