// src/features/dashboard/pages/profile/EditProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaSave } from 'react-icons/fa';

// Componente reutilizable para las tarjetas de perfil
const ProfileCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-lg shadow-md">
    <header className="flex items-center gap-3 p-4 border-b border-gray-200">
      <div className="text-gray-500">{icon}</div>
      <h2 className="text-lg font-bold text-gray-800">{title}</h2>
    </header>
    <div className="p-6 space-y-4">
      {children}
    </div>
  </div>
);

// Componente para una fila de formulario (Label + Input)
const FormRow = ({ label, id, children }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {children}
  </div>
);

const EditProfilePage = () => {
  // --- ESTADO Y DATOS ---
  // En una aplicación real, estos datos vendrían de una API o un contexto de autenticación.
  const [currentUser, setCurrentUser] = useState(null);

  // Simulamos la carga de los datos del usuario actual
  useEffect(() => {
    setTimeout(() => {
      setCurrentUser({
        name: 'Daniela V.',
        lastName: 'Velasquez',
        email: 'daniela.v@conv3rtech.com',
        phone: '300 123 4567',
        avatarSeed: 'Daniela',
      });
    }, 500);
  }, []);

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    // TODO: Aquí iría la lógica para enviar la información personal actualizada a la API.
    alert('Información personal guardada (simulación).');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // TODO: Aquí iría la lógica para enviar el cambio de contraseña a la API.
    alert('Contraseña actualizada (simulación).');
  };

  // --- RENDERIZADO ---
  if (!currentUser) {
    // Puedes reemplazar esto con tu componente TableSkeleton si lo deseas
    return <div className="p-8">Cargando perfil...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Editar mi Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- COLUMNA IZQUIERDA: AVATAR --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center text-center">
            <img
              className="h-32 w-32 rounded-full mb-4 ring-4 ring-offset-2 ring-conv3r-gold"
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.avatarSeed}`}
              alt="Avatar del usuario"
            />
            <h2 className="text-2xl font-bold text-gray-900">{currentUser.name} {currentUser.lastName}</h2>
            <p className="text-md text-gray-500">{currentUser.email}</p>
            <button className="mt-6 w-full bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
              Cambiar Foto
            </button>
          </div>
        </div>

        {/* --- COLUMNA DERECHA: FORMULARIOS --- */}
        <div className="lg:col-span-2 space-y-8">
          <ProfileCard title="Información Personal" icon={<FaUser />}>
            <form onSubmit={handleInfoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormRow label="Nombre(s)" id="name">
                <input type="text" id="name" defaultValue={currentUser.name} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold"/>
              </FormRow>
              <FormRow label="Apellido(s)" id="lastName">
                <input type="text" id="lastName" defaultValue={currentUser.lastName} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold"/>
              </FormRow>
              <FormRow label="Correo Electrónico" id="email">
                <input type="email" id="email" defaultValue={currentUser.email} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold"/>
              </FormRow>
              <FormRow label="Teléfono Celular" id="phone">
                <input type="tel" id="phone" defaultValue={currentUser.phone} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold"/>
              </FormRow>
              <div className="md:col-span-2 text-right">
                <button type="submit" className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95">
                  <FaSave /> Guardar Cambios
                </button>
              </div>
            </form>
          </ProfileCard>

          <ProfileCard title="Cambiar Contraseña" icon={<FaLock />}>
             <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <FormRow label="Contraseña Actual" id="currentPassword">
                 <input type="password" id="currentPassword" placeholder="••••••••" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold"/>
              </FormRow>
              <FormRow label="Nueva Contraseña" id="newPassword">
                 <input type="password" id="newPassword" placeholder="••••••••" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold"/>
              </FormRow>
              <FormRow label="Confirmar Nueva Contraseña" id="confirmPassword">
                 <input type="password" id="confirmPassword" placeholder="••••••••" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold"/>
              </FormRow>
               <div className="text-right pt-2">
                <button type="submit" className="flex items-center gap-2 bg-gray-800 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-gray-900">
                  Actualizar Contraseña
                </button>
              </div>
            </form>
          </ProfileCard>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;