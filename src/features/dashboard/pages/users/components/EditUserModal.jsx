import React, { useState, useEffect } from 'react';
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { showSuccess } from '../../../../../shared/utils/alerts';

const inputBaseStyle = "block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold";

const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 md:p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-0  border-gray-200 pb-3">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const evaluarContrasena = (password) => ({
  longitud: password.length >= 8 && password.length <= 10,
  mayuscula: /[A-Z]/.test(password),
  minuscula: /[a-z]/.test(password),
  numero: /\d/.test(password),
  especial: /[\W_]/.test(password),
});

const EditUserModal = ({ isOpen, onClose, userData, roles, onSubmit }) => {
  const [formData, setFormData] = useState({
    tipoDocumento: '',
    documento: '',
    nombre: '',
    apellido: '',
    celular: '',
    rol: '',
    email: '',
    status: '',
    nuevaContrasena: '',
    confirmarContrasena: ''
  });

  const [errors, setErrors] = useState({});
  const [verContrasena, setVerContrasena] = useState(false);
  const [verConfirmacion, setVerConfirmacion] = useState(false);
  const [validacionesContrasena, setValidacionesContrasena] = useState({
    longitud: false, mayuscula: false, minuscula: false, numero: false, especial: false,
  });

  useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        tipoDocumento: userData.tipo_documento || '',
        documento: userData.documento || '',
        nombre: userData.nombre || '',
        apellido: userData.apellido || '',
        celular: userData.celular || '',
        rol: userData.id_rol || '',
        email: userData.correo || '',
        status: userData.estado_usuario || '',
        nuevaContrasena: '',
        confirmarContrasena: ''
      });
      setErrors({});
    }
  }, [isOpen, userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validaciones en vivo
    setErrors(prev => {
      const updated = { ...prev };
      if (value) updated[name] = '';

      if (name === 'celular') {
        const celRegex = /^\+?[0-9]{10,13}$/;
        if (!celRegex.test(value)) updated.celular = 'Debe tener entre 10 y 13 dígitos';
      }

      if (name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) updated.email = 'Correo inválido';
      }

      if (name === 'nuevaContrasena') {
        const validaciones = evaluarContrasena(value);
        setValidacionesContrasena(validaciones);

        const esValida = Object.values(validaciones).every(Boolean);
        updated.nuevaContrasena = esValida ? '' : 'Debe cumplir todos los requisitos';

        if (formData.confirmarContrasena && value !== formData.confirmarContrasena) {
          updated.confirmarContrasena = 'No coinciden';
        } else {
          updated.confirmarContrasena = '';
        }
      }

      if (name === 'confirmarContrasena' && value !== formData.nuevaContrasena) {
        updated.confirmarContrasena = 'No coinciden';
      }

      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const celularRegex = /^\+?[0-9]{10,13}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.nombre) newErrors.nombre = "Campo obligatorio";
    if (!formData.apellido) newErrors.apellido = "Campo obligatorio";
    if (!formData.celular || !celularRegex.test(formData.celular)) newErrors.celular = "Número inválido";
    if (!formData.rol) newErrors.rol = "Selecciona un rol";
    if (!formData.status) { newErrors.status = "Selecciona un estado"; }
    if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = "Correo inválido";

    // Validar contraseña solo si hay algo escrito
    if (formData.nuevaContrasena || formData.confirmarContrasena) {
      const val = evaluarContrasena(formData.nuevaContrasena);
      const esValida = Object.values(val).every(Boolean);
      if (!esValida) newErrors.nuevaContrasena = "Debe cumplir todos los requisitos";
      if (formData.nuevaContrasena !== formData.confirmarContrasena) {
        newErrors.confirmarContrasena = "No coinciden";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Transformar los datos al formato que espera la API
    const userDataForApi = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      correo: formData.email,
      id_rol: parseInt(formData.rol),
      documento: formData.documento,
      tipo_documento: formData.tipoDocumento,
      celular: formData.celular,
      estado_usuario: formData.status,
      ...(formData.nuevaContrasena && { contrasena: formData.nuevaContrasena })
    };

    onSubmit(userDataForApi);
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
          <h2 className="text-2xl font-bold text-gray-800">Editar Usuario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2">
            <FaTimes />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-300 text-left">

          <FormSection title="Información del Usuario">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel htmlFor="tipoDocumento">Tipo de Documento</FormLabel>
                <select id="tipoDocumento" name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} className={inputBaseStyle}>
                  <option value="">Seleccionar...</option>
                  <option value="CC">CC</option>
                  <option value="PPT">PPT</option>
                  <option value="NIT">NIT</option>
                  <option value="PA">PA</option>
                  <option value="CE">CE</option>
                  <option value="TI">TI</option>
                </select>
              </div>

              <div>
                <FormLabel htmlFor="documento">Documento</FormLabel>
                <input id="documento" name="documento" value={formData.documento} className={`${inputBaseStyle} bg-gray-100 cursor-not-allowed`} disabled />
              </div>

              <div>
                <FormLabel htmlFor="nombre">Nombre</FormLabel>
                <input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className={inputBaseStyle} />
                {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}
              </div>

              <div>
                <FormLabel htmlFor="apellido">Apellido</FormLabel>
                <input id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} className={inputBaseStyle} />
                {errors.apellido && <p className="text-red-500 text-sm">{errors.apellido}</p>}
              </div>

              <div>
                <FormLabel htmlFor="celular">Celular</FormLabel>
                <input id="celular" name="celular" value={formData.celular} onChange={handleChange} className={inputBaseStyle} />
                {errors.celular && <p className="text-red-500 text-sm">{errors.celular}</p>}
              </div>

              <div>
                <FormLabel htmlFor="rol">Rol</FormLabel>
                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className={inputBaseStyle}
                >
                  <option value="">Seleccionar...</option>
                  {(Array.isArray(roles) ? roles : []).map((rol) => (
                    <option key={rol.id_rol} value={rol.id_rol}>
                      {rol.nombre_rol}
                    </option>
                  ))}
                </select>
                {errors.rol && <p className="text-red-500 text-sm mt-1">{errors.rol}</p>}
              </div>


              <div className="col-span-2">
                <FormLabel htmlFor="email">Correo Electrónico</FormLabel>
                <input id="email" name="email" value={formData.email} onChange={handleChange} className={inputBaseStyle} />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
            </div>
            <div>
              <FormLabel htmlFor="status">Estado del Usuario</FormLabel>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputBaseStyle}
              >
                <option value="">Seleccionar...</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Suspendido">Suspendido</option>
                <option value="En vacaciones">En vacaciones</option>
                <option value="Retirado">Retirado</option>
                <option value="Licencia médica">Licencia médica</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>
          </FormSection>

          <FormSection title="Actualizar Contraseña (opcional)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <FormLabel htmlFor="nuevaContrasena">Nueva Contraseña</FormLabel>
                <input
                  id="nuevaContrasena"
                  name="nuevaContrasena"
                  type={verContrasena ? "text" : "password"}
                  value={formData.nuevaContrasena}
                  onChange={handleChange}
                  className={inputBaseStyle}
                />
                <button type="button" className="absolute top-9 right-3 text-gray-600" onClick={() => setVerContrasena(prev => !prev)}>
                  {verContrasena ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.nuevaContrasena && <p className="text-red-500 text-sm">{errors.nuevaContrasena}</p>}
              </div>

              <div className="relative">
                <FormLabel htmlFor="confirmarContrasena">Confirmar Contraseña</FormLabel>
                <input
                  id="confirmarContrasena"
                  name="confirmarContrasena"
                  type={verConfirmacion ? "text" : "password"}
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                  className={inputBaseStyle}
                />
                <button type="button" className="absolute top-9 right-3 text-gray-600" onClick={() => setVerConfirmacion(prev => !prev)}>
                  {verConfirmacion ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.confirmarContrasena && <p className="text-red-500 text-sm">{errors.confirmarContrasena}</p>}
              </div>
            </div>

            {/* Reglas visibles (opcional) */}
            {formData.nuevaContrasena && (
              <div className="text-sm text-gray-700 ml-2 mt-2 space-y-0">
                <p className={validacionesContrasena.longitud ? "text-green-600" : "text-red-500"}>{validacionesContrasena.longitud ? '✓' : '✗'} Entre 8 y 10 caracteres</p>
                <p className={validacionesContrasena.mayuscula ? "text-green-600" : "text-red-500"}>{validacionesContrasena.mayuscula ? '✓' : '✗'} Al menos una mayúscula</p>
                <p className={validacionesContrasena.minuscula ? "text-green-600" : "text-red-500"}>{validacionesContrasena.minuscula ? '✓' : '✗'} Al menos una minúscula</p>
                <p className={validacionesContrasena.numero ? "text-green-600" : "text-red-500"}>{validacionesContrasena.numero ? '✓' : '✗'} Al menos un número</p>
                <p className={validacionesContrasena.especial ? "text-green-600" : "text-red-500"}>{validacionesContrasena.especial ? '✓' : '✗'} Al menos un símbolo</p>
              </div>
            )}
          </FormSection>

          <div className="flex justify-end gap-4 pt-6 border-t mt-6">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
            <button type="submit" className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
