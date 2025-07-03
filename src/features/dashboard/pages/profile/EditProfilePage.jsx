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
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

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
      setForm({
        name: 'Daniela V.',
        lastName: 'Velasquez',
        email: 'daniela.v@conv3rtech.com',
        phone: '300 123 4567',
      });
    }, 500);
  }, []);

  const validateForm = (f) => {
    const errors = {};
    if (!f.name.trim()) errors.name = 'El nombre es obligatorio.';
    if (!f.lastName.trim()) errors.lastName = 'El apellido es obligatorio.';
    if (!f.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) errors.email = 'Correo inválido.';
    if (!f.phone.match(/^\d{3,4}[\s-]?\d{3}[\s-]?\d{3,4}$/)) errors.phone = 'Teléfono inválido.';
    return errors;
  };
  const validatePasswords = (p) => {
    const errors = {};
    if (!p.current) errors.current = 'Ingresa tu contraseña actual.';
    if (!p.new || p.new.length < 8) errors.new = 'La nueva contraseña debe tener al menos 8 caracteres.';
    if (p.new !== p.confirm) errors.confirm = 'Las contraseñas no coinciden.';
    return errors;
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    setSuccessMsg('');
  };
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: undefined }));
    setPasswordMsg('');
  };

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSuccessMsg('¡Información personal guardada!');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const errors = validatePasswords(passwords);
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setPasswordMsg('¡Contraseña actualizada!');
    setPasswords({ current: '', new: '', confirm: '' });
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
                <input type="text" id="name" name="name" value={form.name} onChange={handleInfoChange} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold ${formErrors.name ? 'border-red-400' : ''}`}/>
                {formErrors.name && <span className="text-xs text-red-500">{formErrors.name}</span>}
              </FormRow>
              <FormRow label="Apellido(s)" id="lastName">
                <input type="text" id="lastName" name="lastName" value={form.lastName} onChange={handleInfoChange} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold ${formErrors.lastName ? 'border-red-400' : ''}`}/>
                {formErrors.lastName && <span className="text-xs text-red-500">{formErrors.lastName}</span>}
              </FormRow>
              <FormRow label="Correo Electrónico" id="email">
                <input type="email" id="email" name="email" value={form.email} onChange={handleInfoChange} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold ${formErrors.email ? 'border-red-400' : ''}`}/>
                {formErrors.email && <span className="text-xs text-red-500">{formErrors.email}</span>}
              </FormRow>
              <FormRow label="Teléfono Celular" id="phone">
                <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleInfoChange} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold ${formErrors.phone ? 'border-red-400' : ''}`}/>
                {formErrors.phone && <span className="text-xs text-red-500">{formErrors.phone}</span>}
              </FormRow>
              <div className="md:col-span-2 text-right">
                <button type="submit" className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95" disabled={Object.keys(formErrors).length > 0}>
                  <FaSave /> Guardar Cambios
                </button>
                {successMsg && <div className="text-green-600 text-sm mt-2 text-left">{successMsg}</div>}
              </div>
            </form>
          </ProfileCard>

          <ProfileCard title="Cambiar Contraseña" icon={<FaLock />}>
             <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <FormRow label="Contraseña Actual" id="currentPassword">
                 <input type="password" id="currentPassword" name="current" value={passwords.current} onChange={handlePasswordChange} placeholder="••••••••" className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold ${passwordErrors.current ? 'border-red-400' : ''}`}/>
                 {passwordErrors.current && <span className="text-xs text-red-500">{passwordErrors.current}</span>}
              </FormRow>
              <FormRow label="Nueva Contraseña" id="newPassword">
                 <input type="password" id="newPassword" name="new" value={passwords.new} onChange={handlePasswordChange} placeholder="••••••••" className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold ${passwordErrors.new ? 'border-red-400' : ''}`}/>
                 {passwordErrors.new && <span className="text-xs text-red-500">{passwordErrors.new}</span>}
              </FormRow>
              <FormRow label="Confirmar Nueva Contraseña" id="confirmPassword">
                 <input type="password" id="confirmPassword" name="confirm" value={passwords.confirm} onChange={handlePasswordChange} placeholder="••••••••" className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold ${passwordErrors.confirm ? 'border-red-400' : ''}`}/>
                 {passwordErrors.confirm && <span className="text-xs text-red-500">{passwordErrors.confirm}</span>}
              </FormRow>
               <div className="text-right pt-2">
                <button type="submit" className="flex items-center gap-2 bg-gray-800 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-gray-900" disabled={Object.keys(passwordErrors).length > 0}>
                  Actualizar Contraseña
                </button>
                {passwordMsg && <div className="text-green-600 text-sm mt-2 text-left">{passwordMsg}</div>}
              </div>
            </form>
          </ProfileCard>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;