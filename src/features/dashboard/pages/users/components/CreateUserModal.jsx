import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 md:p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-0  border-gray-200 pb-3">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const inputBaseStyle = "block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold";

const evaluarContrasena = (password) => {
  return {
    longitud: password.length >= 8 && password.length <= 10,
    mayuscula: /[A-Z]/.test(password),
    minuscula: /[a-z]/.test(password),
    numero: /\d/.test(password),
    especial: /[\W_]/.test(password),
  };
};


const CreateUserModal = ({ isOpen, onClose, roles, onSubmit, usuariosExistentes = [] }) => {

  const initialState = {
    tipoDocumento: '',
    documento: '',
    nombre: '',
    apellido: '',
    celular: '',
    rol: '',
    email: '',
    contrasena: '',
    confirmarContrasena: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [validacionesContrasena, setValidacionesContrasena] = useState({
  longitud: false,
  mayuscula: false,
  minuscula: false,
  numero: false,
  especial: false,
});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialState);
      setErrors({});
    }
  }, [isOpen]);

  // Maneja los cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    setErrors(prev => {
      const updatedErrors = { ...prev };

      // Limpiar error si se escribe algo
      if (value) updatedErrors[name] = '';

      // Validación celular
      if (name === 'celular') {
        const celularRegex = /^\+?[0-9]{10,13}$/;
        if (!celularRegex.test(value)) {
          updatedErrors.celular = 'Debe tener entre 10 y 13 dígitos, solo números (opcional + al inicio)';
        }
      }

      // Validación email
      if (name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          updatedErrors.email = 'El formato del correo no es válido';
        }
      }

      // Validación contraseña
      if (name === 'contrasena') {
        const validaciones = evaluarContrasena(value);
        setValidacionesContrasena(validaciones);

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,10}$/;
        if (!passwordRegex.test(value)) {
          updatedErrors.contrasena = 'Debe cumplir todos los requisitos';
        } else {
          updatedErrors.contrasena = '';
        }

        if (formData.confirmarContrasena && value !== formData.confirmarContrasena) {
          updatedErrors.confirmarContrasena = 'Las contraseñas no coinciden';
        } else {
          updatedErrors.confirmarContrasena = '';
        }
      }

      if (name === 'documento') {
        const existeDocumento = usuariosExistentes.some(
          (u) =>
            typeof u.documento === 'string' &&
            u.documento.toLowerCase() === value.toLowerCase()
        );
        updatedErrors.documento = existeDocumento ? 'Este documento ya está registrado' : '';
      }

      if (name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          updatedErrors.email = 'El formato del correo no es válido';
        } else {
          const existeCorreo = usuariosExistentes.some(
            (u) =>
              typeof u.email === 'string' &&
              u.email.toLowerCase() === value.toLowerCase()
          );
          updatedErrors.email = existeCorreo ? 'Este correo ya está registrado' : '';
        }
      }


      return updatedErrors;
    });
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const celularRegex = /^\+?[0-9]{10,13}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.tipoDocumento) newErrors.tipoDocumento = "Selecciona un tipo de documento";
    if (!formData.documento) newErrors.documento = "El documento es obligatorio";
    if (!formData.nombre) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.apellido) newErrors.apellido = "El apellido es obligatorio";

    if (!formData.celular) {
      newErrors.celular = "El celular es obligatorio";
    } else if (!celularRegex.test(formData.celular)) {
      newErrors.celular = 'Debe tener entre 10 y 13 dígitos, solo números (opcional + al inicio)';
    }

    if (!formData.rol) newErrors.rol = "Selecciona un rol";

    if (!formData.email) {
      newErrors.email = "El correo es obligatorio";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'El formato del correo no es válido';
    }

    if (!formData.contrasena) {
      newErrors.contrasena = "La contraseña es obligatoria";
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = "Debe tener al menos 6 caracteres";
    }

    if (!formData.confirmarContrasena) {
      newErrors.confirmarContrasena = "Confirma tu contraseña";
    } else if (formData.contrasena !== formData.confirmarContrasena) {
      newErrors.confirmarContrasena = "Las contraseñas no coinciden";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
    setFormData(initialState);
    onClose();
  };


  if (!isOpen) return null;

    return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12" onClick={onClose}>

    <div
      className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <header className="flex justify-between items-center p-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">Crear Usuario</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2">
          <FaTimes />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-300">

        {/* Sección principal */}
        <FormSection title="Información Personal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <FormLabel htmlFor="tipoDocumento">Tipo de Documento</FormLabel>
              <select id="tipoDocumento" name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} className={inputBaseStyle}>
                <option value="">Seleccionar...</option>
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
              </select>
              {errors.tipoDocumento && <p className="text-red-500 text-sm mt-1">{errors.tipoDocumento}</p>}
            </div>

            <div>
              <FormLabel htmlFor="documento">Documento</FormLabel>
              <input id="documento" name="documento" value={formData.documento} onChange={handleChange} className={inputBaseStyle} />
              {errors.documento && <p className="text-red-500 text-sm mt-1">{errors.documento}</p>}
            </div>

            <div>
              <FormLabel htmlFor="nombre">Nombre</FormLabel>
              <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className={inputBaseStyle} />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <FormLabel htmlFor="apellido">Apellido</FormLabel>
              <input id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} className={inputBaseStyle} />
              {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
            </div>

            <div>
              <FormLabel htmlFor="celular">Celular</FormLabel>
              <input id="celular" name="celular" value={formData.celular} onChange={handleChange} className={inputBaseStyle} />
              {errors.celular && <p className="text-red-500 text-sm mt-1">{errors.celular}</p>}
            </div>

            <div>
              <FormLabel htmlFor="rol">Rol</FormLabel>
              <select id="rol" name="rol" value={formData.rol} onChange={handleChange} className={inputBaseStyle}>
                <option value="">Seleccionar...</option>
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.name}>{rol.name}</option>
                ))}
              </select>
              {errors.rol && <p className="text-red-500 text-sm mt-1">{errors.rol}</p>}
            </div>

            <div className="col-span-2">
              <FormLabel htmlFor="email">Correo Electrónico</FormLabel>
              <input id="email" name="email" value={formData.email} onChange={handleChange} className={inputBaseStyle} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="flex justify-around gap-4 col-span-2">
              <div className='w-full'>
                <FormLabel htmlFor="contrasena">Contraseña</FormLabel>
                <input
                  type="password"
                  id="contrasena"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  className={inputBaseStyle}
                />
                {errors.contrasena && <p className="text-red-500 text-sm mt-1">{errors.contrasena}</p>}

                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p className={validacionesContrasena.longitud ? "text-green-600" : "text-red-500"}>
                    {validacionesContrasena.longitud ? '✅' : '❌'} Entre 8 y 10 caracteres
                  </p>
                  <p className={validacionesContrasena.mayuscula ? "text-green-600" : "text-red-500"}>
                    {validacionesContrasena.mayuscula ? '✅' : '❌'} Al menos una letra mayúscula
                  </p>
                  <p className={validacionesContrasena.minuscula ? "text-green-600" : "text-red-500"}>
                    {validacionesContrasena.minuscula ? '✅' : '❌'} Al menos una letra minúscula
                  </p>
                  <p className={validacionesContrasena.numero ? "text-green-600" : "text-red-500"}>
                    {validacionesContrasena.numero ? '✅' : '❌'} Al menos un número
                  </p>
                  <p className={validacionesContrasena.especial ? "text-green-600" : "text-red-500"}>
                    {validacionesContrasena.especial ? '✅' : '❌'} Al menos un símbolo (ej. @, #, $)
                  </p>
                </div>
              </div>

              <div className='w-full'>
                <FormLabel htmlFor="confirmarContrasena">Confirmar Contraseña</FormLabel>
                <input
                  type="password"
                  id="confirmarContrasena"
                  name="confirmarContrasena"
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                  className={inputBaseStyle}
                />
                {errors.confirmarContrasena && <p className="text-red-500 text-sm mt-1">{errors.confirmarContrasena}</p>}
              </div>
            </div>
          </div>
        </FormSection>

        {/* Footer botones */}
        <div className="flex justify-end gap-4 pt-6 border-t mt-6">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
          <button type="submit" className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105">Crear Usuario</button>
        </div>
      </form>
    </div>
  </div>
);

};

export default CreateUserModal;
